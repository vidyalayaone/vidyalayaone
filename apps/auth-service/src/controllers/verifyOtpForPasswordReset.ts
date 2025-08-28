import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { verifyOTPByUserId } from '../services/otpService';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { verifyOtpForPasswordResetSchema } from '../validations/validationSchemas';
import { OtpPurpose } from '../generated/client';
import { sign } from 'jsonwebtoken';
import config from '../config/config';
import { fetchUserByUsernameAndContext } from '../utils/fetchUserBasedOnContext';

const { prisma } = DatabaseService;

// Short-lived reset-password JWT generator
function generateResetPasswordToken(userId: string) {
  const payload = {
    userId,
    type: 'reset-password',
  };
  // Expire in 10 minutes
  return sign(payload, config.jwt.accessSecret, { expiresIn: '10m' });
}

export async function verifyOtpForPasswordReset(req: Request, res: Response) {
  try {
    const validation = validateInput(verifyOtpForPasswordResetSchema, req.body, res);
    if (!validation.success) return;

    const { username, otp } = validation.data;
    const { context, subdomain } = getSchoolContext(req);

    const user = await fetchUserByUsernameAndContext(res, prisma, username, context, subdomain);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    // Verify OTP
    const valid = await verifyOTPByUserId(user.id, otp, OtpPurpose.password_reset);
    if (!valid) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired OTP' },
        timestamp: new Date().toISOString()
      });
      return;
    } 

    // Issue a short-lived reset-password token
    const resetToken = generateResetPasswordToken(user.id);

    res.status(200).json({
      success: true,
      message: 'OTP verified. Use the token to reset password.',
      data: {
        resetToken
      },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error: any) {
    console.error('Error verifying OTP for password reset:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
