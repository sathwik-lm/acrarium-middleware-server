import { WorkerManager } from '../../src/services/worker-management';

jest.mock('child_process', () => ({
    fork: jest.fn(() => ({
        on: jest.fn(),
        kill: jest.fn(),
    })),
}));

jest.mock('../../src/config/redis', () => ({
    redisClient: {
        lLen: jest.fn().mockResolvedValue(0),
        connect: jest.fn().mockResolvedValue(true),
    },
}));

describe('Worker Manager', () => {
    afterEach(() => {
        WorkerManager.stopAll();
    });

    it('should start sender worker', () => {
        const started = WorkerManager.startSenderWorker('test-sender');
        expect(started).toBe(true);
    });

    it('should not start sender worker twice', () => {
        WorkerManager.startSenderWorker('test-sender');
        const started = WorkerManager.startSenderWorker('test-sender');
        expect(started).toBe(false);
    });

    it('should stop sender worker', () => {
        WorkerManager.startSenderWorker('test-sender');
        const stopped = WorkerManager.stopSenderWorker('test-sender');
        expect(stopped).toBe(true);
    });

    it('should start cleanup worker', () => {
        const started = WorkerManager.startCleanupWorker();
        expect(started).toBe(true);
    });

    it('should get workers status', () => {
        WorkerManager.startSenderWorker('test-sender');
        WorkerManager.startCleanupWorker();

        const status = WorkerManager.getWorkersStatus();

        expect(status.senders.length).toBe(1);
        expect(status.cleanup.running).toBe(true);
    });

    it('should stop all workers', () => {
        WorkerManager.startSenderWorker('test-sender-1');
        WorkerManager.startSenderWorker('test-sender-2');
        WorkerManager.startCleanupWorker();

        WorkerManager.stopAll();

        const status = WorkerManager.getWorkersStatus();
        expect(status.senders.length).toBe(0);
        expect(status.cleanup.running).toBe(false);
    });
});