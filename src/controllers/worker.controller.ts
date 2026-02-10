import { Request, Response } from 'express';
import { WorkerManager } from '../services/worker-management';

export class WorkerController {
    static async startSender(req: Request, res: Response) {
        const { workerId } = req.body;
        const started = WorkerManager.startSenderWorker(workerId || 'sender-manual');
        res.json({ success: started, message: started ? 'Sender started' : 'Sender already running' });
    }

    static async stopSender(req: Request, res: Response) {
        const { workerId } = req.body;
        const stopped = WorkerManager.stopSenderWorker(workerId || 'sender-manual');
        res.json({ success: stopped, message: stopped ? 'Sender stopped' : 'Sender not running' });
    }

    static async startCleanup(req: Request, res: Response) {
        const started = WorkerManager.startCleanupWorker();
        res.json({ success: started, message: started ? 'Cleanup started' : 'Cleanup already running' });
    }

    static async stopCleanup(req: Request, res: Response) {
        const stopped = WorkerManager.stopCleanupWorker();
        res.json({ success: stopped, message: stopped ? 'Cleanup stopped' : 'Cleanup not running' });
    }

    static async startMonitor(req: Request, res: Response) {
        const started = WorkerManager.startMonitorWorker();
        res.json({ success: started, message: started ? 'Monitor started' : 'Monitor already running' });
    }

    static async stopMonitor(req: Request, res: Response) {
        const stopped = WorkerManager.stopMonitorWorker();
        res.json({ success: stopped, message: stopped ? 'Monitor stopped' : 'Monitor not running' });
    }

    static async getStatus(req: Request, res: Response) {
        const status = WorkerManager.getWorkersStatus();
        res.json(status);
    }

    static async stopAll(req: Request, res: Response) {
        WorkerManager.stopAll();
        res.json({ success: true, message: 'All workers stopped' });
    }
}