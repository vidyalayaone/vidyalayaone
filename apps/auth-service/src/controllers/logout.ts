import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { validateInput } from '@vidyalayaone/common-utils';
import { logoutSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export async function logout(req: Request, res: Response) {
  try {
    const validation = validateInput(logoutSchema, req.body, res);
    if (!validation.success) return;

    const { refreshToken } = validation.data;

    // Find and revoke the refresh token
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (tokenRecord) {
      await prisma.refreshToken.delete({
        where: { token: refreshToken }
      });
    }

    // Always return success, even if token wasn't found (security best practice)
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Still return success to avoid revealing internal state
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  }
}

