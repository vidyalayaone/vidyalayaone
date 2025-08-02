import { Request, Response } from 'express';
import config from '../config/config';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database';
import { createAndSendOTP } from '../services/otpService';
import { getTenantContext } from '@vidyalayaone/common-utils';
import { registerSchema } from '../validations/validationSchemas';
import { validateInput } from '../validations/validationHelper';
import { Role } from '../generated/client';

const { prisma } = DatabaseService;

export async function register(req: Request, res: Response) {
  try {
    const validation = validateInput(registerSchema, req.body, res);
    if (!validation.success) return;
    
    const { email, phone, username, password } = validation.data;
    const { context, tenantId } = getTenantContext(req);

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Provided context must be platform' },
        timestamp: new Date().toISOString()
      });
      return;
    } 

    const existingUsername = await prisma.user.findFirst({ where: { username, tenantId } });
    if (existingUsername) {
      res.status(409).json({
        success: false,
        error: { message: 'Username already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, config.security.bcryptSaltRounds);

    const newUser = await prisma.user.create({
      data: { email, phone, username, passwordHash, role: 'ADMIN' as Role, tenantId },
    });

    // await createAndSendOTP(email);
    await createAndSendOTP({ email: null, phone, isTestSms: true, userId: newUser.id, purpose: 'registration' });

    res.status(201).json({
      success: true,
      data: { message: 'Admin registration successful. Please verify your phone number.' },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error: any) {
    console.error('Registration failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: error?.message || 'Unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
