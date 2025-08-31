import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getUser, getSchoolContext } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getMyTeacherId(req: Request, res: Response): Promise<void> {
  try {
    const userData = getUser(req);
    const userId = userData?.id;
    const { context, schoolId } = getSchoolContext(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'User authentication required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (context !== 'school') {
      res.status(403).json({
        success: false,
        error: { message: 'Context must be school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'SchoolId context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Find the teacher record for the logged-in user
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: userId,
        schoolId: schoolId
      },
      select: {
        id: true,
        userId: true,
        schoolId: true,
        firstName: true,
        lastName: true,
        employeeId: true
      }
    });

    if (!teacher) {
      res.status(404).json({
        success: false,
        error: { message: 'Teacher profile not found for this user' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Teacher ID retrieved successfully',
      data: {
        teacherId: teacher.id,
        userId: teacher.userId,
        schoolId: teacher.schoolId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        employeeId: teacher.employeeId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching teacher ID:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching teacher ID' },
      timestamp: new Date().toISOString()
    });
  }
}
