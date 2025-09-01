import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

function verifyAccessToken(token: string): jwt.JwtPayload | string {
  console.log('🔐 :', config.jwt.accessSecret);
  return jwt.verify(token, config.jwt.accessSecret);
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    // console.log('🔐 Authenticating request, Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        error: { message: 'No token provided' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // console.log(token);

    const decoded = verifyAccessToken(token) as any;



    
    

    // req.user = decoded;

    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role-id'] = decoded.roleId;
    req.headers['x-user-role-name'] = decoded.roleName;
    req.headers['x-user-permissions'] = JSON.stringify(decoded.permissions);

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(401).json({ 
      success: false,
      error: { message: 'Invalid or expired token' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
