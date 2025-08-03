import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { verifyOTPByUserId } from '../services/otpService';
import { getSchoolContext } from '@vidyalayaone/common-utils';
import { verifyOtpForPasswordResetSchema } from '../validations/validationSchemas';
import { validateInput } from '../validations/validationHelper';
import { OtpPurpose } from '../generated/client';

const { prisma } = DatabaseService;

export async function verifyOtpForPasswordReset(req: Request, res: Response) {
  try {
    const validation = validateInput(verifyOtpForPasswordResetSchema, req.body, res);
    if (!validation.success) return;

    const { username, otp } = validation.data;
    const { context } = getSchoolContext(req);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(404).json({
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

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      data: {},
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
