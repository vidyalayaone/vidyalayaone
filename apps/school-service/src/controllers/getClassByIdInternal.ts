import { Request, Response } from 'express';
import DatabaseService from "../services/database";

const { prisma } = DatabaseService;

export async function getClassByIdInternal(req: Request, res: Response): Promise<void> {
  try {
    const { classId } = req.params;

    if (!classId) {
      res.status(400).json({
        success: false,
        error: { message: 'Class ID is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get class with its sections
    const classData = await prisma.class.findUnique({
      where: {
        id: classId
      },
      include: {
        sections: {
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!classData) {
      res.status(404).json({
        success: false,
        error: { message: 'Class not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        class: {
          id: classData.id,
          name: classData.name,
          schoolId: classData.schoolId,
          academicYear: classData.academicYear,
          sections: classData.sections.map(section => ({
            id: section.id,
            name: section.name,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })),
          createdAt: classData.createdAt,
          updatedAt: classData.updatedAt
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching class by ID:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching class' },
      timestamp: new Date().toISOString()
    });
  }
}
