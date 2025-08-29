import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { getAttendanceStatsSchema } from '../validations/attendanceSchemas';

const { prisma } = DatabaseService;

export async function getAttendanceStats(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(
      getAttendanceStatsSchema,
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

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    // Get overall statistics
    const overallStats = await prisma.studentAttendance.groupBy({
      by: ['status'],
      where: {
        classId: classId,
        sectionId: sectionId,
        schoolId: schoolId,
        attendanceDate: {
          gte: parsedStartDate,
          lte: parsedEndDate
        }
      },
      _count: {
        id: true
      }
    });

    // Get daily statistics
    const dailyStats = await prisma.studentAttendance.groupBy({
      by: ['attendanceDate', 'status'],
      where: {
        classId: classId,
        sectionId: sectionId,
        schoolId: schoolId,
        attendanceDate: {
          gte: parsedStartDate,
          lte: parsedEndDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        attendanceDate: 'asc'
      }
    });

    // Process statistics
    const overallStatsSummary = overallStats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Process daily stats
    const dailyStatsMap = dailyStats.reduce((acc: Record<string, Record<string, number>>, stat: any) => {
      const dateKey = stat.attendanceDate.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {};
      }
      acc[dateKey][stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    const totalRecords = Object.values(overallStatsSummary).reduce((sum: number, count: unknown) => sum + (count as number), 0);

    res.status(200).json({
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: {
        overallStats: {
          summary: overallStatsSummary,
          totalRecords,
          attendancePercentage: totalRecords > 0 ? 
            Math.round((overallStatsSummary.PRESENT || 0) / totalRecords * 100) : 0
        },
        dailyStats: dailyStatsMap,
        meta: {
          classId,
          sectionId,
          dateRange: {
            startDate: startDate,
            endDate: endDate
          }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting attendance stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching attendance statistics' },
      timestamp: new Date().toISOString()
    });
  }
}
