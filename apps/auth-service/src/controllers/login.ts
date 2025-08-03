import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { getSchoolContext } from '@vidyalayaone/common-utils';
import { loginSchema } from '../validations/validationSchemas';
import { validateInput } from '../validations/validationHelper';

const { prisma } = DatabaseService;

export async function login(req: Request, res: Response) {
  try {
    const validation = validateInput(loginSchema, req.body, res);
    if (!validation.success) return;

    const { username, password } = validation.data;
    const { context, subdomain } = getSchoolContext(req);

    let user;
    if( context ==='platform'){
        user = await prisma.user.findUnique({
          where: { username },
          select: {
            id: true,
            passwordHash: true,
            role: true,
            isActive: true,
            isPhoneVerified: true
          }
        });
        if (!user) {
          res.status(404).json({
            success: false,
            error: { message: 'User not found' },
            timestamp: new Date().toISOString()
          });
          return;
        }
        if( user.role !=='ADMIN'){
            res.status(403).json({
                success: false,
                error: { message: 'Only admin users can login' },
                timestamp: new Date().toISOString()
            });
            return;
        }
      }
    else if( context === 'school') {
      user = await prisma.user.findFirst({
        where: { username, subdomain },
        select: {
          id: true,
          passwordHash: true,
          role: true,
          isActive: true,
          isPhoneVerified: true
        }
      });
      if (!user){
        const usernameWithSubdomain = `${username}@${subdomain}`;
        user = await prisma.user.findFirst({
            where: { username: usernameWithSubdomain },
            select: {
                id: true,
                passwordHash: true,
                role: true,
                isActive: true,
                isPhoneVerified: true
            }
        });
        if (!user) {
            res.status(404).json({
                success: false,
                error: { message: 'User not found' },
                timestamp: new Date().toISOString()
            });
            return;
        }
      }
    }
    else {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid context' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: { message: 'User is not active' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!user.isPhoneVerified) {
      res.status(403).json({
        success: false,
        error: { message: 'Phone number not verified' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid username or password' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      role: user.role
    });
    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          role: user.role
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
