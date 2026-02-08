import { Router } from "express";
import { CrashController } from "../controllers/reciver.crash.controller";

const router = Router();

router.post('/crash', CrashController.receiveCrash);
export default router;