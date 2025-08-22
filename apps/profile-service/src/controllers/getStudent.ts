import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getStudent(req: Request, res: Response) {
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
        error: { message: 'Student access is only allowed in school context' },
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

    // Only allow ADMIN, TEACHER, and STUDENT roles
    if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(user.role)) {
      res.status(403).json({
        success: false,
        error: { message: 'Access denied. Only admins, teachers, and students can access student information' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Find the student
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        guardians: {
          include: {
            guardian: true,
          },
        },
        enrollments: {
          where: { isCurrent: true },
        },
        documents: true,
      },
    });

    if (!student) {
      res.status(404).json({
        success: false,
        error: { message: 'Student not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify that the student belongs to the same school as the context
    if (student.schoolId !== schoolId) {
      res.status(403).json({
        success: false,
        error: { message: 'Access denied. Student does not belong to your school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Additional access control for STUDENT role
    // Students can only access their own profile
    if (user.role === 'STUDENT' && student.userId !== user.id) {
      res.status(403).json({
        success: false,
        error: { message: 'Students can only access their own profile' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        student,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching student:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching student' },
      timestamp: new Date().toISOString()
    });
  }
}
