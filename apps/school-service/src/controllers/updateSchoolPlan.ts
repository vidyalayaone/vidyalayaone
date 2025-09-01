import { Request, Response } from 'express';
import DatabaseService from '../services/database';

const { prisma } = DatabaseService;

interface UpdatePlanRequest {
  plan: string;
}

export async function updateSchoolPlan(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params;
    const { plan } = req.body as UpdatePlanRequest;

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'School ID is required',
          code: 'MISSING_SCHOOL_ID'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!plan) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Plan is required',
          code: 'MISSING_PLAN'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, metaData: true }
    });

    if (!existingSchool) {
      res.status(404).json({
        success: false,
        error: {
          message: 'School not found',
          code: 'SCHOOL_NOT_FOUND'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Update school metadata with plan information
    const currentMetaData = (existingSchool.metaData as Record<string, any>) || {};
    const updatedMetaData = {
      ...currentMetaData,
      plan: plan,
      planUpdatedAt: new Date().toISOString()
    };

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        metaData: updatedMetaData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        metaData: true,
        updatedAt: true
      }
    });

    console.log(`[SCHOOL SERVICE] Updated plan for school ${schoolId}: ${plan}`);

    res.status(200).json({
      success: true,
      data: {
        school: {
          id: updatedSchool.id,
          name: updatedSchool.name,
          plan: plan,
          updatedAt: updatedSchool.updatedAt.toISOString()
        }
      },
      message: 'School plan updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[SCHOOL SERVICE] Error updating school plan:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
