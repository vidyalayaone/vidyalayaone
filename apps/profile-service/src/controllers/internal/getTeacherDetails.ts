import { Request, Response } from 'express';
import DatabaseService from "../../services/database";

const { prisma } = DatabaseService;

export async function getTeacherDetails(req: Request, res: Response): Promise<void> {
  try {
    const { teacherId } = req.params;
    
    if (!teacherId) {
      res.status(400).json({
        success: false,
        error: { message: 'Teacher ID is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify this is an internal request
    const isInternalRequest = req.headers['x-internal-request'] === 'true';
    if (!isInternalRequest) {
      res.status(403).json({
        success: false,
        error: { message: 'This endpoint is only accessible for internal service requests' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Fetch teacher details
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        schoolId: true,
        gender: true,
        joiningDate: true,
        subjectIds: true,
        metaData: true
      }
    });

    if (!teacher) {
      res.status(404).json({
        success: false,
        error: { message: 'Teacher not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          fullName: `${teacher.firstName} ${teacher.lastName}`,
          employeeId: teacher.employeeId,
          schoolId: teacher.schoolId,
          gender: teacher.gender,
          joiningDate: teacher.joiningDate,
          subjectIds: teacher.subjectIds,
          metaData: teacher.metaData
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching teacher details (internal):', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching teacher details' },
      timestamp: new Date().toISOString()
    });
  }
}
