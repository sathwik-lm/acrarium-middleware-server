import { redisClient } from '../config/redis';
import { esClient } from '../config/elasticsearch';
import { AcrariumService } from '../services/sender.crash.service';

export class SenderWorker {
    private static CRASH_QUEUE = 'crashes_queue';
    private static CLEANUP_QUEUE = 'cleanup_queue';
    private static CRASH_INDEX = 'crashes';
    private static RATE_LIMIT_MS = 1000;
    private static MAX_RETRIES = 3;

    static async start() {
        console.log(' Sender Worker started');

        while (true) {
            try {
                const crashId = await redisClient.lPop(this.CRASH_QUEUE);

                if (!crashId) {
                    await this.sleep(1000);
                    continue;
                }

                await this.processCrash(crashId);
                await this.sleep(this.RATE_LIMIT_MS);
            } catch (error) {
                console.error('Sender worker error:', error);
                await this.sleep(5000);
            }
        }
    }

    private static async processCrash(crashId: string) {
        try {
            const result = await esClient.get({
                index: this.CRASH_INDEX,
                id: crashId,
            });

            const doc = result._source as any;
            const { crashData, retryCount, got500 } = doc;

            const { success, statusCode } = await AcrariumService.sendCrash(crashData);

            if (success) {
                await this.markAsSent(crashId);
                await redisClient.rPush(this.CLEANUP_QUEUE, crashId);
                console.log(`Sent crash ${crashId}`);
            } else if (statusCode === 500) {
                await this.handleServerError(crashId, retryCount);
            } else {
                await this.handleFailure(crashId, retryCount, statusCode);
            }
        } catch (error) {
            console.error(`Failed to process crash ${crashId}:`, error);
        }
    }

    private static async markAsSent(crashId: string) {
        await esClient.update({
            index: this.CRASH_INDEX,
            id: crashId,
            doc: {
                status: 'sent',
                sentAt: new Date().toISOString(),
            },
        });
    }

    private static async handleServerError(crashId: string, retryCount: number) {
        await esClient.update({
            index: this.CRASH_INDEX,
            id: crashId,
            doc: {
                got500: true,
                retryCount: retryCount + 1,
            },
        });

        if (retryCount < this.MAX_RETRIES) {
            await redisClient.rPush(this.CRASH_QUEUE, crashId);
            console.log(` 500 error for ${crashId}, retry ${retryCount + 1}`);
        } else {
            await esClient.update({
                index: this.CRASH_INDEX,
                id: crashId,
                doc: { status: 'failed_500' },
            });
            console.log(` Max retries for ${crashId}`);
        }
    }

    private static async handleFailure(crashId: string, retryCount: number, statusCode: number) {
        await esClient.update({
            index: this.CRASH_INDEX,
            id: crashId,
            doc: {
                status: 'failed',
                retryCount: retryCount + 1,
                lastErrorCode: statusCode,
            },
        });
        console.log(` Failed to send ${crashId}, status ${statusCode}`);
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}