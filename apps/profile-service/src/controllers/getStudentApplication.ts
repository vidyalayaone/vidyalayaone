import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export const getStudentApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate student ID parameter
    if (!id) {
      res.status(400).json({
        success: false,
        error: { message: 'Student ID is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    // Only allow access in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Student application access is only allowed in school context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID is required from context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check permissions
    if (!hasPermission(PERMISSIONS.ADMISSION.VIEW, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions to view student applications' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Find the student application
    const student = await prisma.student.findFirst({
      where: {
        id,
        schoolId
      },
      include: {
        guardians: {
          include: {
            guardian: true
          }
        },
        enrollments: true,
        documents: true
      }
    });

    if (!student) {
      res.status(404).json({
        success: false,
        error: { message: 'Student application not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        student
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching student application:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching student application' },
      timestamp: new Date().toISOString()
    });
  }
}
