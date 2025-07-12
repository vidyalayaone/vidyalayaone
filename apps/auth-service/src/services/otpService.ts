import { generateOTP } from '../utils/otp';
import EmailService from './emailService';
import config from '../config/config';
import DatabaseService from '../services/database';

const { prisma } = DatabaseService;

// Update createAndSendOTP to handle tenant context
export async function createAndSendOTP(email: string, tenantId?: string): Promise<void> {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + config.security.otpExpiresIn * 60 * 1000);

    // Save to database with optional tenant_id
    await prisma.oTP.create({
      data: { 
        email, 
        otp, 
        expiresAt, 
        isUsed: false,
        tenantId: tenantId || null
      },
    });

    await EmailService.sendOTPEmail(email, otp);
    console.log(`✅ OTP sent to ${email}${tenantId ? ` for tenant ${tenantId}` : ' (platform)'}`);
  } catch (error) {
    console.error('❌ Failed to create and send OTP:', error);
    throw new Error('Failed to send verification email');
  }
}

// Keep existing verifyOTP for platform (no tenant)
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  try {
    const record = await prisma.oTP.findFirst({
      where: { 
        email, 
        otp, 
        isUsed: false, 
        expiresAt: { gt: new Date() },
        tenantId: null // Platform OTPs have no tenant_id
      },
    });

    if (!record) {
      return false;
    }

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

// New function for school OTP verification
export async function verifyOTPWithTenant(email: string, otp: string, tenantId?: string): Promise<boolean> {
  try {
    const record = await prisma.oTP.findFirst({
      where: { 
        email, 
        otp, 
        isUsed: false, 
        expiresAt: { gt: new Date() },
        tenantId: tenantId ?? null
      },
    });

    if (!record) {
      return false;
    }

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
