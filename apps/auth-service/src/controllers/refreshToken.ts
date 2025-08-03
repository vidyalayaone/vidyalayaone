import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { getSchoolContext } from '@vidyalayaone/common-utils';
import { refreshTokenSchema } from '../validations/validationSchemas';
import { validateInput } from '../validations/validationHelper';

const { prisma } = DatabaseService;

export async function refreshToken(req: Request, res: Response) {
  try {
    const validation = validateInput(refreshTokenSchema, req.body, res);
    if (!validation.success) return;

    const { refreshToken } = validation.data;
    const rotateToken = true; // Optional token rotation
    const schoolContext = getSchoolContext(req);

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
    
    // Check if refresh token exists in database
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

    // Validate school context
    if (schoolContext?.context === 'platform' && tokenRecord.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { message: 'Only admin can refresh token on platform' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: payload.id,
      role: payload.role
    });

    let newRefreshToken = refreshToken; // Keep existing by default

    // Rotate refresh token if requested (security best practice)
    if (rotateToken) {
      newRefreshToken = generateRefreshToken({
        id: payload.id,
        role: payload.role
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
