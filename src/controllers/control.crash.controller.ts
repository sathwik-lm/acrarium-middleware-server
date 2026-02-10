import { Request, Response } from "express";
import { redisClient } from "../config/redis";
import { esClient } from "../config/elasticsearch";

export class ControlController {

    private static CRASH_QUEUE = 'crashes_queue';
    private static CLEANUP_QUEUE = 'cleanup_queue';

    static async getStatus(req: Request, res: Response) {
        try {
            const crashQueueLength = await redisClient.lLen(ControlController.CRASH_QUEUE);
            const cleanupQueueLength = await redisClient.lLen(ControlController.CLEANUP_QUEUE);
            const esHealth = await esClient.cluster.health();
            res.json({
                queue: {
                    crash: crashQueueLength,
                    cleanup: cleanupQueueLength,
                },
                elasticsearch: {
                    status: esHealth.status,
                    numberofNodes: esHealth.number_of_data_nodes,
                },
                redis: {
                    connected: redisClient.isOpen,
                },
            });
        } catch (error) {
            res.status(500).json({ error: "Failed to get status" });
        }
    }


    static async getCrashStats(req: Request, res: Response) {
        try {
            const stats = await esClient.count({ index: 'crashes' });

            const pending = await esClient.count({
                index: 'crashes',
                query: { term: { status: 'pending' } },
            });

            const sent = await esClient.count({
                index: 'crashes',
                query: { term: { status: 'sent' } },
            });

            const failed = await esClient.count({
                index: 'crashes',
                query: { term: { status: 'failed' } },
            });

            res.json({
                total: stats.count,
                pending: pending.count,
                sent: sent.count,
                failed: failed.count,
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get crash stats' });
        }
    }


    static async clearQueue(req: Request, res: Response) {
        try {
            const { queue } = req.params;

            if (queue !== 'crash' && queue !== 'cleanup') {
                return res.status(400).json({ error: 'Invalid queue name' });
            }

            const queueName = queue === 'crash' ? ControlController.CRASH_QUEUE : ControlController.CLEANUP_QUEUE;

            let count = 0;
            while (await redisClient.lPop(queueName)) {
                count++;
            }

            res.json({ message: `Cleared ${count} items from ${queue} queue` });
        } catch (error) {
            res.status(500).json({ error: 'Failed to clear queue' });
        }
    }
}