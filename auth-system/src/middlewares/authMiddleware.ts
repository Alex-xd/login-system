import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TokenBlacklist } from "../models/tokenBlacklist";

interface AuthenticatedRequest extends Request {
  user?: any; // 确保 `user` 可用
}

dotenv.config();

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // 检查 token 是否在黑名单中
  const blacklistedToken = await TokenBlacklist.findOne({ token });
  if (blacklistedToken) {
    res.status(403).json({ message: "Token has been revoked" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      console.log(err);
      res.status(403).json({ message: "Invalid token" });
      return;
    }
    req.user = decoded; // 确保 `user` 存储在 `req`
    next();
  });
};
