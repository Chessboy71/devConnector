import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, Authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      token,
      config.get<string>("secretJWT")
    ) as jwt.JwtPayload;

    req.user = decoded.user;
    next();
  } catch {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
