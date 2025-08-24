import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { loginSchema } from '../validations/validationSchemas';
import { DeviceType } from '../generated/client';
import config from '../config/config';
import { fetchUserByUsernameAndContext } from '../utils/fetchUserBasedOnContext';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

// Helper function to detect device type
function getDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return DeviceType.mobile;
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return DeviceType.tablet;
  } else {
    return DeviceType.desktop;
  }
}

// Helper function to get client IP
function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection as any).socket?.remoteAddress ||
         'unknown';
}

// Helper function to parse refresh token expiration
function parseRefreshTokenExpiration(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhm])$/);
  if (!match) {
    return 7; // Default to 7 days
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'd': return value; // days
    case 'h': return value / 24; // hours to days
    case 'm': return value / (24 * 60); // minutes to days
    default: return 7;
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validation = validateInput(loginSchema, req.body, res);
    if (!validation.success) return;

    const { username, password } = validation.data;
    const { context, schoolId } = getSchoolContext(req);

    // console.log(subdomain, context);

    const user = await fetchUserByUsernameAndContext(res, prisma, username, context, schoolId);
    if (!user) return;

    const role = await prisma.role.findUnique({ where: { id: user.roleId } });
    if (!role) {
      res.status(500).json({
        success: false,
        error: { message: 'User role not found. Please contact support.' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    if (context === 'platform'){
      const hasLoginPermission = await hasPermission(PERMISSIONS.PLATFORM.LOGIN, {permissions: role.permissions});
      if (!hasLoginPermission) {
        res.status(403).json({
          success: false,
          error: { message: 'User does not have permission to login on platform' },
          timestamp: new Date().toISOString()
        });
        return;
      }
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
      roleId: user.roleId,
      roleName: role.name,
      permissions: role.permissions || []
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      roleId: user.roleId,
      roleName: role.name,
      permissions: role.permissions || []
    });

    // Get client information
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const deviceType = getDeviceType(userAgent);

    // Calculate refresh token expiration
    const refreshTokenExpiresAt = new Date();
    const daysToAdd = parseRefreshTokenExpiration(config.jwt.refreshExpiresIn);
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + daysToAdd);

    // Save refresh token to database
    const savedRefreshToken = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        ipAddress: ipAddress.substring(0, 45), // Ensure it fits in VARCHAR(45)
        userAgent: userAgent.substring(0, 1000), // Reasonable limit for TEXT field
        deviceType,
        isRevoked: false,
        lastUsedAt: new Date()
      }
    });

    // Optional: Clean up old/expired refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        OR: [
          { expiresAt: { lt: new Date() } }, // Expired tokens
          { isRevoked: true } // Revoked tokens
        ]
      }
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          roleId: user.roleId,
          roleName: role.name,
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
