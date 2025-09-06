import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { createAndSendOtpToEmail } from '../services/otpService';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { forgotPasswordSchema } from '../validations/validationSchemas';
import { OtpPurpose } from '../generated/client';
import { fetchUserByUsernameAndContext } from '../utils/fetchUserBasedOnContext';
import { maskPhoneNumber } from '../utils/maskPhoneNumber';

const { prisma } = DatabaseService;

export async function forgotPassword(req: Request, res: Response) {
  try {
    const validation = validateInput(forgotPasswordSchema, req.body, res);
    if (!validation.success) return;

    const { username } = validation.data;
    const { context, schoolId } = getSchoolContext(req);

    const user = await fetchUserByUsernameAndContext(res, prisma, username, context, schoolId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Send OTP to user's phone (or use email alternative)
    if (user.phone) {
      await createAndSendOtpToEmail({
        userId: user.id,
        email: user.email!,
        purpose: OtpPurpose.password_reset,
      });
    }
    else{
      res.status(400).json({
        success: false,
        error: { message: 'No email address associated with this account' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `OTP sent to ${user.email}. Please check your inbox.`,
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to process forgot password' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
