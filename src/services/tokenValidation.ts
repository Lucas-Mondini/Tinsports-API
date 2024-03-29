import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import logger from "../utils/logger";

export default function(req: Request, res: Response, next: NextFunction) {
  const token = req.header("auth_token");

  if (!token) return res.status(401).json({"message": "Access Denied"});

  try {
    const tokenSecret = String(process.env.TOKEN_SECRET);
    const verified = jwt.verify(token, tokenSecret);

    req.user = verified;

    next();

  } catch(error) {
    logger.error(error);
    res.status(400).json({message: "Invalid token"});
  }
}