import { esClient } from "./config/elasticsearch";
import { redisClient } from "./config/redis"
import { SenderWorker } from "./worker/sender.crash.worker";

async function startSender() {
    try {
        await redisClient.connect();
        await esClient.ping();
        console.log('Connected to Redis and Elasticsearch')
        await SenderWorker.start();
    } catch (error) {
        console.error('Failed to start sender:', error)
        process.exit(1)
    }
}

startSender();