import { Request, Response } from "express";
import { crashSchema } from "../types/crash.types";
import { CrashService } from "../services/reciver.crash.service";

export class CrashController {
    static async receiveCrash(req: Request, res: Response) {
        try {
            const crashData = crashSchema.parse(req.body);
            const crashId = await CrashService.processCrash(crashData);

            res.status(202).json({
                crashId, status: "accepted"
            });
        } catch (error) {
            res.status(400).json({
                error: 'Invalid crash Data'
            });
        }
    }
}