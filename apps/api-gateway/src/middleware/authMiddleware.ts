import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

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

    // console.log(decoded);
    

    // req.user = decoded;

    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role-id'] = decoded.roleId;
    req.headers['x-user-role-name'] = decoded.roleName;

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
