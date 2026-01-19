import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../utils/db"; // Import db from utils
import { signAccessToken, signRefreshToken } from "../utils/jwt";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  // Store the refresh token in the DB
  const decoded: any = jwt.decode(refreshToken);
  await db.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  return res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  const stored = await db.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!stored) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  try {
    const payload: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    const newAccessToken = signAccessToken({ userId: payload.userId });
    return res.json({ accessToken: newAccessToken });
  } catch (e) {
    return res.status(401).json({ message: "Expired refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const authHeader = req.headers.authorization;

  if (refreshToken) {
    await db.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.decode(token);
    await db.blacklistedToken.create({
      data: {
        token,
        expiresAt: new Date(decoded.exp * 1000),
      },
    });
  }

  return res.json({ message: "Logged out successfully" });
};
