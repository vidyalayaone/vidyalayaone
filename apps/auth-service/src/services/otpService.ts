import { generateOTP } from '../utils/otp';
import EmailService from './emailService';
import SmsService from './smsService';
import config from '../config/config';
import DatabaseService from '../services/database';
import { OtpPurpose } from '../generated/client';

const { prisma } = DatabaseService;

interface CreateAndSendOtpToPhoneArgs {
  phone: string;
  isTestSms?: boolean;
  userId: string;
  purpose: OtpPurpose;
}

interface CreateAndSendOtpToEmailArgs {
  email: string;
  userId: string;
  purpose: OtpPurpose;
}

/**
 * Create and send OTP to phone number
 */
export async function createAndSendOtpToPhone({
  phone,
  isTestSms = false,
  userId,
  purpose,
}: CreateAndSendOtpToPhoneArgs): Promise<void> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + config.security.otpExpiresIn * 60 * 1000);

  // Save new OTP in database
  await prisma.otp.create({
    data: {
      userId,
      otp,
      purpose,
      expiresAt,
    },
  });

  // Send SMS
  await SmsService.sendOtpSMS(phone, otp, isTestSms);
  console.log(`✅ OTP sent to phone: ${phone}`);
}

/**
 * Create and send OTP to email
 */
export async function createAndSendOtpToEmail({
  email,
  userId,
  purpose,
}: CreateAndSendOtpToEmailArgs): Promise<void> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + config.security.otpExpiresIn * 60 * 1000);

  // Save new OTP in database
  await prisma.otp.create({
    data: {
      userId,
      otp,
      purpose,
      expiresAt,
    },
  });

  // Send Email
  await EmailService.sendOTPEmail(email, otp);
  console.log(`✅ OTP sent to email: ${email}`);
}

/**
 * OTP verification by userId
 */
export async function verifyOTPByUserId(userId: string, otp: string, purpose: OtpPurpose): Promise<boolean> {
  try {
    const record = await prisma.otp.findFirst({
      where: {
        userId,
        otp,
        purpose,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!record) return false;

    await prisma.otp.update({
      where: { id: record.id },
      data: { isUsed: true }
    });

    return true;
  } catch (error) {
    console.error('❌ OTP verification failed:', error);
    return false;
  }
}
