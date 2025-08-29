import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { getStudentAttendanceSchema } from '../validations/attendanceSchemas';

const { prisma } = DatabaseService;

export async function getStudentAttendance(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(
      getStudentAttendanceSchema,
      { params: req.params, query: req.query },
      res
    );
    if (!validation.success) return;

    const { studentId } = validation.data.params;
    const { startDate, endDate, limit = 50, offset = 0 } = validation.data.query;
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
    if (startDate && endDate) {
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

    const [attendanceRecords, totalCount] = await Promise.all([
      prisma.studentAttendance.findMany({
        where: {
          studentId: studentId,
          schoolId: schoolId,
          ...dateFilter
        },
        orderBy: [
          { attendanceDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.studentAttendance.count({
        where: {
          studentId: studentId,
          schoolId: schoolId,
          ...dateFilter
        }
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Student attendance retrieved successfully',
      data: {
        attendanceRecords,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: totalCount > offset + limit
        },
        meta: {
          studentId,
          filters: { startDate, endDate }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting student attendance:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching student attendance' },
      timestamp: new Date().toISOString()
    });
  }
}
