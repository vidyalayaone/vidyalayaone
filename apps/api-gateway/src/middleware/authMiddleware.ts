import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

interface JwtPayload {
  id: string;
  role: string;
}

function verifyAccessToken(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, config.jwt.accessSecret);
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        error: { message: 'No token provided' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token) as any;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: { message: 'Invalid or expired token' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
