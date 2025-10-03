import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { getClassAttendanceRangeSchema } from '../validations/attendanceSchemas';

const { prisma } = DatabaseService;

interface AttendanceRecord {
  id: string;
  studentId: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  attendanceDate: Date;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  attendanceTakerId: string;
  notes: string | null;
  metaData: any;
  createdAt: Date;
  updatedAt: Date;
}

export async function getClassAttendanceRange(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(
      getClassAttendanceRangeSchema,
      { params: req.params, query: req.query },
      res
    );
    if (!validation.success) return;

    const { classId, sectionId } = validation.data.params;
    const { startDate, endDate } = validation.data.query;
    const { context, schoolId } = getSchoolContext(req);

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate date range
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj > endDateObj) {
      res.status(400).json({
        success: false,
        error: { message: 'Start date cannot be after end date' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if date range is too large (more than 90 days)
    const daysDifference = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDifference > 90) {
      res.status(400).json({
        success: false,
        error: { message: 'Date range cannot exceed 90 days' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Build optimized query with date range filter
    const attendanceRecords = await prisma.studentAttendance.findMany({
      where: {
        classId: classId,
        sectionId: sectionId,
        schoolId: schoolId,
        attendanceDate: {
          gte: new Date(startDateObj.setHours(0, 0, 0, 0)),
          lte: new Date(endDateObj.setHours(23, 59, 59, 999))
        }
      },
      orderBy: [
        { attendanceDate: 'asc' },
        { studentId: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Generate working days in the date range (excluding weekends)
    const generateWorkingDays = (start: Date, end: Date): string[] => {
      const workingDays: string[] = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          workingDays.push(currentDate.toISOString().split('T')[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return workingDays;
    };

    const workingDays = generateWorkingDays(startDateObj, endDateObj);

    // Get unique students from attendance records
    const uniqueStudents = Array.from(new Set(attendanceRecords.map(record => record.studentId)));

    // Calculate attendance statistics
    const stats = {
      totalWorkingDays: workingDays.length,
      totalStudents: uniqueStudents.length,
      totalRecords: attendanceRecords.length,
      attendanceByStatus: {
        PRESENT: attendanceRecords.filter(r => r.status === 'PRESENT').length,
        ABSENT: attendanceRecords.filter(r => r.status === 'ABSENT').length,
        LEAVE: attendanceRecords.filter(r => r.status === 'LEAVE').length,
      }
    };

    // Get unique attendance takers
    const attendanceTakers = Array.from(new Set(attendanceRecords.map(record => record.attendanceTakerId)));

    res.status(200).json({
      success: true,
      message: 'Class attendance range retrieved successfully',
      data: {
        attendanceRecords: attendanceRecords.map(record => ({
          ...record,
          attendanceDate: record.attendanceDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        })),
        workingDays,
        stats,
        meta: {
          classId,
          sectionId,
          dateRange: {
            startDate,
            endDate,
            totalDays: daysDifference + 1,
            workingDays: workingDays.length
          },
          uniqueStudents,
          attendanceTakers,
          query: { startDate, endDate }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting class attendance range:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Internal server error while fetching attendance range',
        // details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      timestamp: new Date().toISOString()
    });
  }
}
