import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { verifyOTPByUserId } from '../services/otpService';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { verifyOtpForRegistrationSchema } from '../validations/validationSchemas';
import { OtpPurpose } from '../generated/client';

const { prisma } = DatabaseService;

export async function verifyOtpForRegistration(req: Request, res: Response) {
  try {
    const validation = validateInput(verifyOtpForRegistrationSchema, req.body, res);
    if (!validation.success) return;
    const { username, otp } = validation.data;
    const { context } = getSchoolContext(req);

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Provided context must be platform' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (user.isPhoneVerified) {
      res.status(400).json({
        success: false,
        error: { message: 'User is already verified' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify OTP
    const valid = await verifyOTPByUserId(user.id, otp, OtpPurpose.registration);
    if (!valid) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired OTP' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Update verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isPhoneVerified: true,
        phoneVerifiedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'User verified successfully.',
      data: {},
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'OTP verification failed',
        details: error?.message || 'Unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
