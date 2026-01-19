import { Router } from "express";
import { addUser, listUsers } from "./user.controller";
import { authMiddleware } from "../auth/auth.middleware"; 

const router = Router();

router.post("/add", authMiddleware, addUser); 
router.get("/list", authMiddleware, listUsers); 

export default router;
