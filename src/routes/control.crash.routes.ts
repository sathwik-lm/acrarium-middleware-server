import { Router } from "express";
import { ControlController } from "../controllers/control.crash.controller";

const router = Router();

router.get('/status', ControlController.getStatus);
router.get('/stats', ControlController.getCrashStats);
router.delete('/queue/:queue', ControlController.clearQueue);

export default router;