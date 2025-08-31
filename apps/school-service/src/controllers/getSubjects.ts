import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getSubjects(req: Request, res: Response): Promise<void> {
  try {
    const userData = getUser(req);
    const { context, schoolId } = getSchoolContext(req);
    console.log(userData);

    // Ensure we're in school context and have schoolId
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Subjects access is only allowed in school context' },
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
    if (!await hasPermission(PERMISSIONS.SUBJECT.VIEW, userData)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to view subjects' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true }
    });

    if (!school) {
      res.status(404).json({
        success: false,
        error: { message: 'School not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get all subjects associated with classes in this school
    // Fetch subjects that are linked to classes belonging to this school
    const schoolSubjects = await prisma.subject.findMany({
      where: {
        classes: {
          some: {
            schoolId: schoolId
          }
        }
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        school: {
          id: school.id,
          name: school.name
        },
        subjects: schoolSubjects,
        totalSubjects: schoolSubjects.length
      },
      message: 'Subjects retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching subjects:', error);

    // Handle Prisma errors
    if (error.code && error.code.startsWith('P')) {
      res.status(400).json({
        success: false,
        error: { message: 'Database error occurred', details: error.message },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error occurred while fetching subjects' },
      timestamp: new Date().toISOString()
    });
  }
}
