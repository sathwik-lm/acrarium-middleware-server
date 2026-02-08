import { redisClient } from '../config/redis';
import { esClient } from '../config/elasticsearch';

export class CleanupWorker {

    private static CLEANUP_QUEUE = 'cleanup_queue';
    private static CRASH_INDEX = 'crashes';

    static async start() {
        console.log('Cleanup Worker started');

        while (true) {
            try {
                const crashId = await redisClient.lPop(this.CLEANUP_QUEUE);

                if (!crashId) {
                    await this.sleep(5000);
                    continue;
                }

                await this.deleteCrash(crashId);
            } catch (error) {
                console.error('Cleanup worker error:', error);
                await this.sleep(5000);
            }
        }
    }

    private static async deleteCrash(crashId: string) {
        try {
            await esClient.delete({
                index: this.CRASH_INDEX,
                id: crashId,
            });
            console.log(` Deleted crash ${crashId}`);
        } catch (error) {
            console.error(`Failed to delete crash ${crashId}:`, error);
        }
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}