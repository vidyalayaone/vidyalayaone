import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { verifyOTPWithTenant } from '../services/otpService';
import { getTenantContext } from "../utils/tenantContext";
import { verifyOtpSchema } from '../validations/validationSchemas';
import { validateInput } from '../validations/validationHelper';

const { prisma } = DatabaseService;

export async function verifyOtp(req: Request, res: Response) {
  try {
    const validation = validateInput(verifyOtpSchema, req.body, res);
    if (!validation.success) return;
    
    const { email, otp } = validation.data;
    const { context, tenantId } = getTenantContext(req);

    const valid = await verifyOTPWithTenant(email, otp, tenantId);
    if (!valid) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired OTP' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    await prisma.user.updateMany({
      where: {
        email,
        tenantId
      },
      data: {
        isVerified: true
      }
    });

    res.status(200).json({
      success: true,
      data: { message: 'Email verified successfully.' },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error: any) {
    console.error('OTP verification failed:', error);
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
