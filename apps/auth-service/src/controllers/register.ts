import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database';
import { createAndSendOtpToEmail } from '../services/otpService';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { registerSchema } from '../validations/validationSchemas';
import config from '../config/config';
import { maskPhoneNumber } from '../utils/maskPhoneNumber';

const { prisma } = DatabaseService;

export async function register(req: Request, res: Response) {
  try {
    const validation = validateInput(registerSchema, req.body, res);
    if (!validation.success) return;
    
    const { username, phone, email, password } = validation.data;
    const { context } = getSchoolContext(req);

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Provided context must be platform' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Ensure a role named "DEFAULT" exists in the platform school scope and fetch it so we can attach it to the user
    const defaultRoleName = 'DEFAULT';
    let defaultRole = await prisma.role.findFirst({ where: { name: defaultRoleName } });
    if (!defaultRole) {
      // give an error if DEFAULT role is missing
      res.status(500).json({
        success: false,
        error: { message: 'System misconfiguration: DEFAULT role is missing. Please contact support.' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if user exists (username is globally unique now)
    const existingUser = await prisma.user.findUnique({ where: { username } });
    
    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        // Update existing unverified user
        const passwordHash = await bcrypt.hash(password, config.security.bcryptSaltRounds);
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            email,
            phone,
            passwordHash,
            isActive: true,
            updatedAt: new Date(),
            schoolId: defaultRole.schoolId,
            // Attach DEFAULT role via relation connect
            role: { connect: { id: defaultRole.id } },
          },
        });

        // Send OTP
        await createAndSendOtpToEmail({ 
          userId: updatedUser.id, 
          email, 
          purpose: 'registration' 
        });

        res.status(200).json({
          success: true,
          message: 'Registration successful. Please verify your email address.',
          data: { 
            user_id: updatedUser.id, 
            email: email
          },
          timestamp: new Date().toISOString()
        });
        return;
      } else {
        // User already verified
        res.status(409).json({
          success: false,
          error: { message: 'User already exists' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    } else {
      // Create new user
      const passwordHash = await bcrypt.hash(password, config.security.bcryptSaltRounds);
      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          phone,
          passwordHash,
          // Attach DEFAULT role via relation connect
          role: { connect: { id: defaultRole.id } },
          schoolId: defaultRole.schoolId,
          isActive: true,
        },
      });

      // Send OTP
      await createAndSendOtpToEmail({ 
        userId: newUser.id, 
        email, 
        purpose: 'registration' 
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email address.',
        data: { 
          user_id: newUser.id, 
          email: email
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
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


