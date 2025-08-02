import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { verifyOTPByUserId, verifyOTPByContact } from '../services/otpService';
import { getTenantContext } from '@vidyalayaone/common-utils';
import { verifyOtpSchema } from '../validations/validationSchemas';
import { validateInput } from '../validations/validationHelper';
import { OtpPurpose } from '../generated/client';

const { prisma } = DatabaseService;

export async function verifyOtp(req: Request, res: Response) {
  try {
    const validation = validateInput(verifyOtpSchema, req.body, res);
    if (!validation.success) return;

    // Accept phone or email for verification
    const { phone, email, otp } = validation.data as { phone?: string, email?: string, otp: string };
    const { tenantId } = getTenantContext(req);

    // Find the user by phone or email; for registration flow, it's usually by phone
    let user: any = null;

    if (phone) {
      user = await prisma.user.findFirst({ where: { phone, tenantId } });
    } else if (email) {
      user = await prisma.user.findFirst({ where: { email, tenantId } });
    }

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found for verification' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Try to verify OTP
    const valid = await verifyOTPByUserId(user.id, otp, OtpPurpose.registration);
    if (!valid) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired OTP' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Update verification field(s) based on what was verified
    let updateData: any = {};
    if (phone) updateData.isPhoneVerified = true;
    if (email) updateData.isEmailVerified = true;

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: { message: `${phone ? 'Phone' : 'Email'} verified successfully.` },
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

// import { Request, Response } from 'express';
// import DatabaseService from '../services/database';
// import { verifyOTPWithTenant } from '../services/otpService';
// import { getTenantContext } from '@vidyalayaone/common-utils';
// import { verifyOtpSchema } from '../validations/validationSchemas';
// import { validateInput } from '../validations/validationHelper';
//
// const { prisma } = DatabaseService;
//
// export async function verifyOtp(req: Request, res: Response) {
//   try {
//     const validation = validateInput(verifyOtpSchema, req.body, res);
//     if (!validation.success) return;
//
//     const { email, otp } = validation.data;
//     const { context, tenantId } = getTenantContext(req);
//
//     const valid = await verifyOTPWithTenant(email, otp, tenantId);
//     if (!valid) {
//       res.status(400).json({
//         success: false,
//         error: { message: 'Invalid or expired OTP' },
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
//
//     await prisma.user.updateMany({
//       where: {
//         email,
//         tenantId
//       },
//       data: {
//         isVerified: true
//       }
//     });
//
//     res.status(200).json({
//       success: true,
//       data: { message: 'Email verified successfully.' },
//       timestamp: new Date().toISOString()
//     });
//     return;
//   } catch (error: any) {
//     console.error('OTP verification failed:', error);
//     res.status(500).json({
//       success: false,
//       error: {
//         message: 'OTP verification failed',
//         details: error?.message || 'Unexpected error occurred'
//       },
//       timestamp: new Date().toISOString()
//     });
//     return;
//   }
// }
