import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { rejectStudentApplicationSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export const rejectStudentApplication = async (req: Request, res: Response) => {
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
    if (!hasPermission(PERMISSIONS.ADMISSION.REJECT, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions to reject student applications' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate request body (optional reason)
    const validation = rejectStudentApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: { 
          message: 'Validation failed',
          details: validation.error.issues
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { reason } = validation.data;

    // Find the student application
    const student = await prisma.student.findFirst({
      where: {
        id,
        schoolId,
        status: 'PENDING'
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
        error: { message: 'Pending student application not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Update student status to rejected
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        status: 'REJECTED',
        metaData: {
          ...(student.metaData as any || {}),
          rejectionReason: reason,
          rejectedAt: new Date().toISOString(),
          rejectedBy: user.id
        }
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

    res.status(200).json({
      success: true,
      data: {
        student: updatedStudent,
        message: 'Student application rejected successfully'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error rejecting student application:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while rejecting student application' },
      timestamp: new Date().toISOString()
    });
  }
}
