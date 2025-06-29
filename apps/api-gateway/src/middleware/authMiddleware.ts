import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      res.status(401).json({
        success: false,
        error: { message: 'No token provided' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    
    next();
    return;
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token' },
      timestamp: new Date().toISOString(),
    });
    return;
  }
}
