import { Request, Response } from 'express';
import DatabaseService from "../services/database";

const { prisma } = DatabaseService;

export async function getGlobalSubjects(req: Request, res: Response): Promise<void> {
  try {
    // Get all global subjects (all subjects in the system)
    const globalSubjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        description: true
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        subjects: globalSubjects,
        totalSubjects: globalSubjects.length
      },
      message: 'Global subjects retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching global subjects:', error);

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
      error: { message: 'Internal server error occurred while fetching global subjects' },
      timestamp: new Date().toISOString()
    });
  }
}
