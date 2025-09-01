import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { getClassAttendanceSchema } from '../validations/attendanceSchemas';

const { prisma } = DatabaseService;

export async function getClassAttendance(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(
      getClassAttendanceSchema,
      { params: req.params, query: req.query },
      res
    );
    if (!validation.success) return;

    const { classId, sectionId } = validation.data.params;
    const { date, startDate, endDate } = validation.data.query;
    const { context, schoolId } = getSchoolContext(req);

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Build date filter
    let dateFilter: any = {};
    if (date) {
      // Single date query
      const targetDate = new Date(date);
      dateFilter.attendanceDate = {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lt: new Date(targetDate.setHours(23, 59, 59, 999))
      };
    } else if (startDate && endDate) {
      // Date range query
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      dateFilter.attendanceDate = {
        gte: new Date(startDateObj.setHours(0, 0, 0, 0)),
        lte: new Date(endDateObj.setHours(23, 59, 59, 999))
      };
    } else if (startDate) {
      // From start date onwards
      const startDateObj = new Date(startDate);
      dateFilter.attendanceDate = {
        gte: new Date(startDateObj.setHours(0, 0, 0, 0))
      };
    } else if (endDate) {
      // Up to end date
      const endDateObj = new Date(endDate);
      dateFilter.attendanceDate = {
        lte: new Date(endDateObj.setHours(23, 59, 59, 999))
      };
    }

    const attendanceRecords = await prisma.studentAttendance.findMany({
      where: {
        classId: classId,
        sectionId: sectionId,
        schoolId: schoolId,
        ...dateFilter
      },
      orderBy: [
        { attendanceDate: 'asc' }, // Changed to ascending for better chronological order
        { createdAt: 'desc' }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Class attendance retrieved successfully',
      data: {
        attendanceRecords,
        meta: {
          classId,
          sectionId,
          totalRecords: attendanceRecords.length,
          filters: { date, startDate, endDate },
          dateRange: {
            start: startDate || date,
            end: endDate || date
          }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting class attendance:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching attendance' },
      timestamp: new Date().toISOString()
    });
  }
}
