import { Request, Response } from 'express';
import DatabaseService from "../services/database";

const { prisma } = DatabaseService;

export async function getSubjectsBulk(req: Request, res: Response): Promise<void> {
  try {
    const { subjectIds, schoolId } = req.body;

    // Validate request body
    if (!subjectIds || !Array.isArray(subjectIds)) {
      res.status(400).json({
        success: false,
        error: { message: 'subjectIds array is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'schoolId is required' },
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

    // Get subjects by IDs that are associated with classes in this school
    const subjects = await prisma.subject.findMany({
      where: {
        id: {
          in: subjectIds
        },
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
        subjects: subjects,
        totalSubjects: subjects.length,
        requestedCount: subjectIds.length,
        foundCount: subjects.length
      },
      message: 'Subjects retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching subjects bulk:', error);

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
