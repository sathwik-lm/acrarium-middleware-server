import { randomUUID } from "crypto";
import { CrashData } from "../types/crash.types";
import { esClient } from "../config/elasticsearch";
import { redisClient } from "../config/redis";

export class CrashService {

    private static CRASH_INDEX = 'crashes';
    private static CRASH_QUEUE = 'crashes_queue';

    static async processCrash(crashData: CrashData) {

        const crashId = crashData.eventId || randomUUID();

        await esClient.index({
            index: this.CRASH_INDEX,
            id: crashId,
            document: {
                crashId,
                crashData,
                status: 'pending',
                createdAt: new Date().toISOString(),
                retryCount: 0,
                got500: false
            }
        });

        await redisClient.rPush(this.CRASH_QUEUE, crashId);
        return crashId;
    }
}