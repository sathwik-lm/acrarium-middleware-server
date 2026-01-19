import jwt from "jsonwebtoken";
import { db } from "../utils/db";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  const blacklisted = await db.blacklistedToken.findUnique({
    where: { token },
  });

  if (blacklisted) {
    return res.status(401).json({ message: "Token is blacklisted" });
  }

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token"});
  }
};
