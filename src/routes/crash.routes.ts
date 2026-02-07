import { Router } from "express";
import { CrashController } from "../controllers/crash.controller";

const router = Router();

router.post('/crash', CrashController.receiveCrash);
export default router;