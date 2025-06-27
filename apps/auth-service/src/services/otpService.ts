import { PrismaClient } from '@prisma/client';
import { generateOTP } from '../utils/otp';
import EmailService from './emailService';
import config from '../config/config';

const prisma = new PrismaClient();

export async function createAndSendOTP(email: string): Promise<void> {
  try {
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + config.security.otpExpiresIn * 60 * 1000);

    // Save to database
    await prisma.oTP.create({
      data: { email, otp, expiresAt, isUsed: false },
    });

    // Send email
    await EmailService.sendOTPEmail(email, otp);
    
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to create and send OTP:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  try {
    const record = await prisma.oTP.findFirst({
      where: { 
        email, 
        otp, 
        isUsed: false, 
        expiresAt: { gt: new Date() } 
      },
    });

    if (!record) {
      return false;
    }

    // Mark OTP as used
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
