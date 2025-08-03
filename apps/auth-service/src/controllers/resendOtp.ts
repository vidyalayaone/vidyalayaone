import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { createAndSendOtpToPhone } from '../services/otpService';
import { validateInput } from '@vidyalayaone/common-utils';
import { resendOtpSchema } from '../validations/validationSchemas';
import { OtpPurpose } from '../generated/client/'

const { prisma } = DatabaseService;

export async function resendOtp(req: Request, res: Response) {
  try {
    const validation = validateInput(resendOtpSchema, req.body, res);
    if (!validation.success) return;

    const { username, purpose } = validation.data;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (purpose === 'registration' && user.isPhoneVerified) {
      res.status(400).json({
        success: false,
        error: { message: 'User already verified' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Resend OTP
    await createAndSendOtpToPhone({
      userId: user.id,
      phone: user.phone!,
      isTestSms: true,
      purpose: purpose as OtpPurpose,
    });

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {},
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
      timestamp: new Date().toISOString(),
    });
    return;
  }
}
