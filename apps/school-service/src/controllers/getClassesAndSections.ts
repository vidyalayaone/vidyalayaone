import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getClassesAndSections(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!academicYear || typeof academicYear !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Academic year is required as query parameter' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userData = getUser(req);
    const userId = userData?.id;
    const { context } = getSchoolContext(req);

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

    if(!await hasPermission(PERMISSIONS.CLASS.VIEW, userData)) {
      res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You do not have permission to view classes' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get classes with their sections
    const classes = await prisma.class.findMany({
      where: {
        schoolId,
        academicYear: academicYear as string
      },
      include: {
        sections: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        school: {
          id: school.id,
          name: school.name
        },
        academicYear,
        classes: classes.map(cls => ({
          id: cls.id,
          name: cls.name,
          sections: cls.sections.map(section => ({
            id: section.id,
            name: section.name,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })),
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt
        })),
        totalClasses: classes.length,
        totalSections: classes.reduce((sum, cls) => sum + cls.sections.length, 0)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching classes and sections:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching classes and sections' },
      timestamp: new Date().toISOString()
    });
  }
}
