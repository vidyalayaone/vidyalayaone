import { Request, Response } from 'express';
import config from '../config/config';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database';
import { createAndSendOTP } from '../services/otpService';
import { getTenantContext } from "../utils/tenantContext";
import { registerSchema } from '../validations/validationSchemas';
import { validateInput } from '../validations/validationHelper';

const { prisma } = DatabaseService;

export async function register(req: Request, res: Response) {
  try {
    const validation = validateInput(registerSchema, req.body, res);
    if (!validation.success) return;
    
    const { email, username, password, role } = validation.data;
    const { context, tenantId } = getTenantContext(req);

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Provided context must be platform' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (role !== 'ADMIN') {
      res.status(400).json({
        success: false,
        error: { message: 'Only ADMIN can register on platform' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const existingEmail = await prisma.user.findFirst({ where: { email, tenantId } });
    if (existingEmail) {
      res.status(409).json({
        success: false,
        error: { message: 'Email already exists' },
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

    const hashedPassword = await bcrypt.hash(password, config.security.bcryptSaltRounds);

    await prisma.user.create({
      data: { email, username, password: hashedPassword, role, tenantId },
    });

    await createAndSendOTP(email);

    res.status(201).json({
      success: true,
      data: { message: 'Admin registration successful. Please verify your email.' },
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
