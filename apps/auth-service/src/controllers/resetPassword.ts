import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database';
import { validateInput } from '@vidyalayaone/common-utils';
import { resetPasswordSchema } from '../validations/validationSchemas';
import { verify } from 'jsonwebtoken';
import config from '../config/config';

const { prisma } = DatabaseService;

export async function resetPassword(req: Request, res: Response) {
  try {
    const validation = validateInput(resetPasswordSchema, req.body, res);
    if (!validation.success) return;

    const { reset_token, new_password } = validation.data;

    // Verify reset_token and payload
    let payload: any;
    try {
      payload = verify(reset_token, config.jwt.accessSecret) as any;
    } catch (err) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired reset token' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (payload.type !== 'reset-password' || payload.userId === undefined) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid reset token' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Fetch user
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Update password
    const passwordHash = await bcrypt.hash(new_password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Password reset failed' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
