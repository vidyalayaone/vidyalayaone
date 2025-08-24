import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const { context, subdomain } = getSchoolContext(req);
    const userData = getUser(req);
    const userId = userData?.id;
    const roleId = userData?.roleId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Unauthenticated' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (context == 'platform') {
      const hasGetMePermission = await hasPermission(prisma, PERMISSIONS.PLATFORM.GET_ME, roleId);
      if (!hasGetMePermission) {
        res.status(403).json({
          success: false,
          error: { message: 'Forbidden' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        phone: true,
        username: true,
        role: true,
        schoolId: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        
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
