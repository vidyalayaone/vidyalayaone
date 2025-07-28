import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { getTenantContext } from '../utils/tenantContext';
import { validateInput } from '../validations/validator';
import { updateProfileSchema } from '../validations/schemas';
import DatabaseService from '../services/database';

const { prisma } = DatabaseService;

export async function getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { tenantId } = getTenantContext(req);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!tenantId || !userId) {
      res.status(400).json({
        success: false,
        error: { message: 'Authentication context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    let profile = null;

    if (userRole === 'TEACHER') {
      profile = await prisma.teacher.findFirst({
        where: { userId, tenantId },
        include: {
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
              url: true,
              uploadedAt: true
            }
          }
        }
      });
    } else if (userRole === 'STUDENT') {
      profile = await prisma.student.findFirst({
        where: { userId, tenantId },
        include: {
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
              url: true,
              uploadedAt: true
            }
          }
        }
      });
    }

    if (!profile) {
      res.status(404).json({
        success: false,
        error: { message: 'Profile not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        ...profile,
        userType: userRole
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch profile' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validation = validateInput(updateProfileSchema, req.body, res);
    if (!validation.success) return;

    const { tenantId } = getTenantContext(req);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!tenantId || !userId) {
      res.status(400).json({
        success: false,
        error: { message: 'Authentication context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const updateData = validation.data;

    let updatedProfile = null;

    if (userRole === 'TEACHER') {
      // Check if teacher exists
      const existingTeacher = await prisma.teacher.findFirst({
        where: { userId, tenantId }
      });

      if (!existingTeacher) {
        res.status(404).json({
          success: false,
          error: { message: 'Teacher profile not found' },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check for phone conflicts
      if (updateData.phone) {
        const conflictTeacher = await prisma.teacher.findFirst({
          where: {
            tenantId,
            id: { not: existingTeacher.id },
            phone: updateData.phone
          }
        });

        if (conflictTeacher) {
          res.status(409).json({
            success: false,
            error: { message: 'Phone number already exists' },
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      updatedProfile = await prisma.teacher.update({
        where: { id: existingTeacher.id },
        data: {
          ...updateData,
          dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        },
        include: {
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
              url: true,
              uploadedAt: true
            }
          }
        }
      });

    } else if (userRole === 'STUDENT') {
      // Check if student exists
      const existingStudent = await prisma.student.findFirst({
        where: { userId, tenantId }
      });

      if (!existingStudent) {
        res.status(404).json({
          success: false,
          error: { message: 'Student profile not found' },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check for phone conflicts
      if (updateData.phone) {
        const conflictStudent = await prisma.student.findFirst({
          where: {
            tenantId,
            id: { not: existingStudent.id },
            phone: updateData.phone
          }
        });

        if (conflictStudent) {
          res.status(409).json({
            success: false,
            error: { message: 'Phone number already exists' },
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      updatedProfile = await prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          ...updateData,
          dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        },
        include: {
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
              url: true,
              uploadedAt: true
            }
          }
        }
      });
    }

    if (!updatedProfile) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid user type for profile update' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        ...updatedProfile,
        userType: userRole
      },
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Update my profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update profile' },
      timestamp: new Date().toISOString()
    });
  }
}
