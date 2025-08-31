import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { markAttendanceSchema } from '../validations/attendanceSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function markAttendance(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(markAttendanceSchema, { body: req.body }, res);
    if (!validation.success) return;

    const { classId, sectionId, attendanceDate, attendanceTakerId, attendanceRecords } = validation.data.body;
    const userData = getUser(req);
    const userId = userData?.id;
    const { context, schoolId } = getSchoolContext(req);

    
    if(context !== 'school') {
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

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'User authentication required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!hasPermission(PERMISSIONS.ATTENDANCE.MARK, userData)){
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions to mark attendance' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Parse the date string to Date object
    const parsedDate = new Date(attendanceDate);

    // Check if attendance already exists for this date and section
    const existingAttendance = await prisma.studentAttendance.findFirst({
      where: {
        sectionId: sectionId,
        attendanceDate: parsedDate,
        schoolId: schoolId
      }
    });

    if (existingAttendance) {
      res.status(409).json({
        success: false,
        error: { message: 'Attendance already marked for this date' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create attendance records
    const createdRecords = await prisma.studentAttendance.createMany({
      data: attendanceRecords.map((record: any) => ({
        studentId: record.studentId,
        classId: classId,
        sectionId: sectionId,
        schoolId: schoolId,
        attendanceDate: parsedDate,
        status: record.status,
        notes: record.notes,
        attendanceTakerId: attendanceTakerId,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        recordsCreated: createdRecords.count,
        classId,
        sectionId,
        attendanceDate: attendanceDate,
        attendanceTaker: userId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while marking attendance' },
      timestamp: new Date().toISOString()
    });
  }
}
