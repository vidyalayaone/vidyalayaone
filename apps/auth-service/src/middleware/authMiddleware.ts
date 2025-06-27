import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    
    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, isVerified: true, createdAt: true }
    });

    if (!user) {
      res.status(401).json({ 
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({ 
        success: false,
        error: { message: 'Email not verified' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Add user to request object
    req.user = user;
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
