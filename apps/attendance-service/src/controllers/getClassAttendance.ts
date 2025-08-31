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
      dateFilter.attendanceDate = new Date(date);
    } else if (startDate && endDate) {
      dateFilter.attendanceDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      dateFilter.attendanceDate = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      dateFilter.attendanceDate = {
        lte: new Date(endDate)
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
        { attendanceDate: 'desc' },
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
          filters: { date, startDate, endDate }
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
