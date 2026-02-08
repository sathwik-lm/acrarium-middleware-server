import { esClient } from "./config/elasticsearch";
import { redisClient } from "./config/redis";
import { CleanupWorker } from "./worker/cleanup.crash.worker";


async function startCleanup() {
    try {
        await redisClient.connect();
        await esClient.ping();
        console.log('Connected to Redis and ElasticSearch');
        await CleanupWorker.start();
    } catch (error) {
        console.error('Failed to start Cleanup:', error);
        process.exit(1)
    }

}

startCleanup();