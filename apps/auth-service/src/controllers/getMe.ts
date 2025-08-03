import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const { context, subdomain } = getSchoolContext(req);
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Unauthenticated' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (context == 'platform' && role!='ADMIN') {
      res.status(400).json({
        success: false,
        error: { message: 'Only admin can use getMe on platform bfnddddddd' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        email: true,
        username: true,
        role: true,
        subdomain: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
        phone: true
      }
    });
    res.status(200).json({
      success: true,
      user,
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user information' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
