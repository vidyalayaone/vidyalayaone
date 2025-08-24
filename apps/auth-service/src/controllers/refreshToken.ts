import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { getSchoolContext, getUser, validateInput } from '@vidyalayaone/common-utils';
import { refreshTokenSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function refreshToken(req: Request, res: Response) {
  try {
    const validation = validateInput(refreshTokenSchema, req.body, res);
    if (!validation.success) return;

    const { refreshToken } = validation.data;
    const rotateToken = true; // Optional token rotation
    const schoolContext = getSchoolContext(req);
    // const user = getUser(req);

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    // Type guard for payload
    if (typeof payload === 'string') {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token format' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { role: true }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!user.role) {
      res.status(500).json({
        success: false,
        error: { message: 'User role not found. Please contact support.' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate school context
    if (schoolContext.context === 'platform'){
          const hasLoginPermission = await hasPermission(PERMISSIONS.PLATFORM.LOGIN, {permissions: user.role.permissions});
          if (!hasLoginPermission) {
            res.status(403).json({
              success: false,
              error: { message: 'User does not have permission to refresh token on platform' },
              timestamp: new Date().toISOString()
            });
            return;
          }
        }
    else if (schoolContext.context === 'school'){
      if (user.schoolId !== schoolContext.schoolId) {
        res.status(401).json({
          success: false, 
          error: { message: 'User does not belong to the specified school', schoolContext },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }
    else {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid school context' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Check if refresh token exists in databases === '
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });
    

    if (!tokenRecord || tokenRecord.userId !== payload.id) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({
        where: { token: refreshToken }
      });
      
      res.status(401).json({
        success: false,
        error: { message: 'Refresh token expired' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: payload.id,
      roleId: payload.roleId,
      roleName: payload.roleName,
      permissions: payload.permissions || []
    });

    let newRefreshToken = refreshToken; // Keep existing by default

    // Rotate refresh token if requested (security best practice)
    if (rotateToken) {
      newRefreshToken = generateRefreshToken({
        id: payload.id,
        roleId: payload.roleId,
        roleName: payload.roleName,
        permissions: payload.permissions || []
      });

      // Update refresh token in database
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { 
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { 
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenRotated: rotateToken
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Refresh token error:', error);
    
    // If error is due to invalid token, return 401
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired refresh token' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
      timestamp: new Date().toISOString()
    });
  }
}
