import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database';
import { validateInput } from '@vidyalayaone/common-utils';
import { z } from 'zod';
import config from '../config/config';

const { prisma } = DatabaseService;

// Schema for internal user creation
const createUserForStudentSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  schoolId: z.string().uuid('Invalid school ID format'),
  roleName: z.string().optional().default('STUDENT'),
});

export async function createUserForStudent(req: Request, res: Response) {
  try {
    const validation = validateInput(createUserForStudentSchema, req.body, res);
    if (!validation.success) return;
    
    const { username, email, phone, password, firstName, lastName, schoolId, roleName } = validation.data;

    // Check for internal request header
    const isInternalRequest = req.headers['x-internal-request'] === 'true';
    if (!isInternalRequest) {
      res.status(403).json({
        success: false,
        error: { message: 'This endpoint is only available for internal service requests' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      res.status(400).json({
        success: false,
        error: { message: 'Username already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findFirst({ where: { email } });
      if (existingEmail) {
        res.status(400).json({
          success: false,
          error: { message: 'Email already exists' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        res.status(400).json({
          success: false,
          error: { message: 'Phone number already exists' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Find the role
    const role = await prisma.role.findFirst({ 
      where: { 
        name: roleName,
        schoolId: schoolId 
      } 
    });

    if (!role) {
      res.status(400).json({
        success: false,
        error: { message: `Role '${roleName}' not found for this school` },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.security.bcryptSaltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        phone,
        passwordHash,
        schoolId,
        roleId: role.id,
        isActive: true,
        isPhoneVerified: false, // Auto-verify for internal creation
        isEmailVerified: false, // Email can be verified later
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        schoolId: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        message: 'User created successfully for student',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error creating user for student:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      res.status(400).json({
        success: false,
        error: { message: 'User with this information already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while creating user' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    // Check for internal request header
    const isInternalRequest = req.headers['x-internal-request'] === 'true';
    if (!isInternalRequest) {
      res.status(403).json({
        success: false,
        error: { message: 'This endpoint is only available for internal service requests' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        error: { message: 'User ID is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'User deleted successfully',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Handle case where user doesn't exist
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while deleting user' },
      timestamp: new Date().toISOString()
    });
  }
}
