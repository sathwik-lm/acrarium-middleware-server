import { redisClient } from './config/redis';
import { esClient } from './config/elasticsearch';
import { MonitorWorker } from './worker/monitor.worker';

async function startMonitor() {
    try {
        await redisClient.connect();
        await esClient.ping();
        console.log(' Connected to Redis and Elasticsearch');

        await MonitorWorker.start();
    } catch (error) {
        console.error('Failed to start monitor:', error);
        process.exit(1);
    }
}

startMonitor();