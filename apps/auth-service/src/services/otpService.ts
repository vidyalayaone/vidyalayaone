import { generateOTP } from '../utils/otp';
import EmailService from './emailService';
import SmsService from './smsService'; // don't forget to import this!
import config from '../config/config';
import DatabaseService from '../services/database';
import { OtpPurpose } from '../generated/client';

const { prisma } = DatabaseService;

interface CreateAndSendOtpArgs {
  email?: string;
  phone?: string;
  isTestSms?: boolean;
  userId: string;
  purpose: string;
}

export async function createAndSendOTP({
  email,
  phone,
  isTestSms = false,
  userId,
  purpose,
}: CreateAndSendOtpArgs): Promise<void> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + config.security.otpExpiresIn * 60 * 1000);

  // Save OTP in database
  await prisma.oTP.create({
    data: {
      userId,
      value: otp,
      purpose: purpose as OtpPurpose,
      expiresAt,
    },
  });

  if (email) {
    await EmailService.sendOTPEmail(email, otp);
    console.log(`✅ OTP sent to email: ${email}`);
  }

  if (phone) {
    await SmsService.sendOtpSMS(phone, otp, isTestSms);
    console.log(`✅ OTP sent to phone: ${phone}`);
  }
}

/**
 * OTP verification by userId (works for both phone/email verification flows)
 */
export async function verifyOTPByUserId(userId: string, otp: string, purpose: OtpPurpose): Promise<boolean> {
  try {
    const record = await prisma.oTP.findFirst({
      where: {
        userId,
        value: otp,
        purpose,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!record) return false;

    await prisma.oTP.update({
      where: { id: record.id },
      data: { isUsed: true }
    });

    return true;
  } catch (error) {
    console.error('❌ OTP verification failed:', error);
    return false;
  }
}

/**
 * Helper: Given contact (email or phone) find the user, then verify OTP
 */
export async function verifyOTPByContact(contact: { email?: string; phone?: string }, otp: string, purpose: OtpPurpose): Promise<boolean> {
  try {
    let user;
    if (contact.email) {
      user = await prisma.user.findFirst({ where: { email: contact.email } });
    } else if (contact.phone) {
      user = await prisma.user.findFirst({ where: { phone: contact.phone } });
    } else {
      return false;
    }
    if (!user) return false;
    return await verifyOTPByUserId(user.id, otp, purpose);
  } catch (error) {
    console.error('❌ OTP verification by contact failed:', error);
    return false;
  }
}
