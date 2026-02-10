import { Router } from 'express';
import { WorkerController } from '../controllers/worker.controller';

const router = Router();

router.post('/sender/start', WorkerController.startSender);
router.post('/sender/stop', WorkerController.stopSender);
router.post('/cleanup/start', WorkerController.startCleanup);
router.post('/cleanup/stop', WorkerController.stopCleanup);
router.post('/monitor/start', WorkerController.startMonitor);
router.post('/monitor/stop', WorkerController.stopMonitor);
router.get('/status', WorkerController.getStatus);
router.post('/stop-all', WorkerController.stopAll);

export default router;