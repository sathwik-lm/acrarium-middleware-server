
import { redisClient } from '../config/redis';
import { env } from '../env';
import { EmailService } from '../services/email.service';
import * as http from 'http';



export class MonitorWorker {
    private static CHECK_INTERVAL = 30000;
    private static lastHealthStatus = true;
    private static CRASH_QUEUE = 'crashes_queue';
    private static CLEANUP_QUEUE = 'cleanup_queue';

    static async start() {
        console.log(' Monitor Worker started');

        while (true) {
            try {
                await this.performHealthCheck();
                await this.checkQueueLengths();
                await this.sleep(this.CHECK_INTERVAL);
            } catch (error) {
                console.error('Monitor worker error:', error);
                await this.sleep(5000);
            }
        }
    }

    private static async performHealthCheck() {
        try {
            const isHealthy = await this.checkAcrariumHealth();

            if (!isHealthy && this.lastHealthStatus) {
                await EmailService.sendAlert('Acrarium API is DOWN');
                console.log(' Acrarium health check failed');
            } else if (isHealthy && !this.lastHealthStatus) {
                await EmailService.sendAlert('Acrarium API is UP');
                console.log(' Acrarium health check passed');
            }

            this.lastHealthStatus = isHealthy;
        } catch (error) {
            console.error('Health check error:', error);
        }
    }



    private static async checkAcrariumHealth(): Promise<boolean> {
        return new Promise((resolve) => {
            const options = {
                hostname: env.ACRARIUM_HOSTNAME,
                port: env.ACRARIUM_PORT,
                path: env.ACRARIUM_PATH,
                method: 'HEAD',
                timeout: 5000,
            };

            const req = http.request(options, (res) => {
                resolve(res.statusCode !== undefined && res.statusCode < 500);
            });

            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });

            req.end();
        });
    }

    private static async checkQueueLengths() {
        try {
            const crashQueueLength = await redisClient.lLen(this.CRASH_QUEUE);
            const cleanupQueueLength = await redisClient.lLen(this.CLEANUP_QUEUE);

            console.log(` Queue status - Crash: ${crashQueueLength}, Cleanup: ${cleanupQueueLength}`);

            if (crashQueueLength > 10000) {
                await EmailService.sendAlert(`Crash queue is large: ${crashQueueLength} items`);
            }
        } catch (error) {
            console.error('Queue check error:', error);
        }
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}