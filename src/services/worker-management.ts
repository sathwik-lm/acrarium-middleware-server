import { ChildProcess, fork } from 'child_process';
import { redisClient } from '../config/redis';

interface WorkerState {
    process: ChildProcess | null;
    isRunning: boolean;
    startedAt: Date | null;
}

export class WorkerManager {
    private static senderWorkers: Map<string, WorkerState> = new Map();
    private static cleanupWorker: WorkerState = { process: null, isRunning: false, startedAt: null };
    private static monitorWorker: WorkerState = { process: null, isRunning: false, startedAt: null };

    private static CRASH_QUEUE = 'crashes_queue';
    private static CLEANUP_QUEUE = 'cleanup_queue';
    private static CRASH_THRESHOLD = 10000;
    private static CLEANUP_THRESHOLD = 5000;

    static startSenderWorker(workerId: string = 'sender-1'): boolean {
        if (this.senderWorkers.has(workerId) && this.senderWorkers.get(workerId)?.isRunning) {
            console.log(`Sender worker ${workerId} already running`);
            return false;
        }

        const process = fork('./dist/sender.js');

        process.on('exit', (code) => {
            console.log(`Sender worker ${workerId} exited with code ${code}`);
            this.senderWorkers.delete(workerId);
        });

        this.senderWorkers.set(workerId, {
            process,
            isRunning: true,
            startedAt: new Date(),
        });

        console.log(` Started sender worker ${workerId}`);
        return true;
    }

    static stopSenderWorker(workerId: string): boolean {
        const worker = this.senderWorkers.get(workerId);

        if (!worker || !worker.isRunning) {
            console.log(`Sender worker ${workerId} not running`);
            return false;
        }

        worker.process?.kill();
        this.senderWorkers.delete(workerId);
        console.log(` Stopped sender worker ${workerId}`);
        return true;
    }

    static startCleanupWorker(): boolean {
        if (this.cleanupWorker.isRunning) {
            console.log('Cleanup worker already running');
            return false;
        }

        const process = fork('./dist/cleanup.js');

        process.on('exit', (code) => {
            console.log(`Cleanup worker exited with code ${code}`);
            this.cleanupWorker = { process: null, isRunning: false, startedAt: null };
        });

        this.cleanupWorker = {
            process,
            isRunning: true,
            startedAt: new Date(),
        };

        console.log(' Started cleanup worker');
        return true;
    }

    static stopCleanupWorker(): boolean {
        if (!this.cleanupWorker.isRunning) {
            console.log('Cleanup worker not running');
            return false;
        }

        this.cleanupWorker.process?.kill();
        this.cleanupWorker = { process: null, isRunning: false, startedAt: null };
        console.log(' Stopped cleanup worker');
        return true;
    }

    static startMonitorWorker(): boolean {
        if (this.monitorWorker.isRunning) {
            console.log('Monitor worker already running');
            return false;
        }

        const process = fork('./dist/monitor.js');

        process.on('exit', (code) => {
            console.log(`Monitor worker exited with code ${code}`);
            this.monitorWorker = { process: null, isRunning: false, startedAt: null };
        });

        this.monitorWorker = {
            process,
            isRunning: true,
            startedAt: new Date(),
        };

        console.log(' Started monitor worker');
        return true;
    }

    static stopMonitorWorker(): boolean {
        if (!this.monitorWorker.isRunning) {
            console.log('Monitor worker not running');
            return false;
        }

        this.monitorWorker.process?.kill();
        this.monitorWorker = { process: null, isRunning: false, startedAt: null };
        console.log(' Stopped monitor worker');
        return true;
    }

    static async autoScale() {
        try {
            const crashQueueLength = await redisClient.lLen(this.CRASH_QUEUE);
            const cleanupQueueLength = await redisClient.lLen(this.CLEANUP_QUEUE);

            console.log(` Queue lengths - Crash: ${crashQueueLength}, Cleanup: ${cleanupQueueLength}`);

            if (crashQueueLength > this.CRASH_THRESHOLD && this.senderWorkers.size === 0) {
                console.log(' Auto-starting sender worker due to high crash queue');
                this.startSenderWorker('sender-auto-1');
            }

            if (crashQueueLength === 0 && this.senderWorkers.size > 0) {
                console.log(' Auto-stopping sender workers due to empty crash queue');
                this.senderWorkers.forEach((_, workerId) => this.stopSenderWorker(workerId));
            }

            if (cleanupQueueLength > this.CLEANUP_THRESHOLD && !this.cleanupWorker.isRunning) {
                console.log(' Auto-starting cleanup worker due to high cleanup queue');
                this.startCleanupWorker();
            }

            if (cleanupQueueLength === 0 && this.cleanupWorker.isRunning) {
                console.log(' Auto-stopping cleanup worker due to empty cleanup queue');
                this.stopCleanupWorker();
            }

        } catch (error) {
            console.error('Auto-scale error:', error);
        }
    }

    static getWorkersStatus() {
        return {
            senders: Array.from(this.senderWorkers.entries()).map(([id, worker]) => ({
                id,
                running: worker.isRunning,
                startedAt: worker.startedAt,
            })),
            cleanup: {
                running: this.cleanupWorker.isRunning,
                startedAt: this.cleanupWorker.startedAt,
            },
            monitor: {
                running: this.monitorWorker.isRunning,
                startedAt: this.monitorWorker.startedAt,
            },
        };
    }

    static stopAll() {
        this.senderWorkers.forEach((_, workerId) => this.stopSenderWorker(workerId));
        this.stopCleanupWorker();
        this.stopMonitorWorker();
        console.log(' Stopped all workers');
    }
}