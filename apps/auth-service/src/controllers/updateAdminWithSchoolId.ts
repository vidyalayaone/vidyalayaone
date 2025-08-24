import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser, validateInput } from '@vidyalayaone/common-utils';
import { updateAdminWithSchoolIdSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export async function updateAdminWithSchoolId(req: Request, res: Response) {
  try {
    const validation = validateInput(updateAdminWithSchoolIdSchema, req.body, res);
    if (!validation.success) return;

    const { schoolId, userId } = validation.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        schoolId,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'School ID updated successfully',
      data: { user_id: userId, schoolId },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error: any) {
    console.error('Error in updateAdminWithSchoolId:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', details: error.message },
      timestamp: new Date().toISOString()
    });
    return;
  }
}