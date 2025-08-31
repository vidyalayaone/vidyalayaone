import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { exportAttendanceSchema } from '../validations/attendanceSchemas';

const { prisma } = DatabaseService;

export async function exportAttendance(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(exportAttendanceSchema, { query: req.query }, res);
    if (!validation.success) return;

    const { classId, sectionId, startDate, endDate, format } = validation.data.query;
    const { context, schoolId } = getSchoolContext(req);

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Build filters
    let whereCondition: any = {
      schoolId: schoolId,
      attendanceDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (classId) {
      whereCondition.classId = classId;
    }

    if (sectionId) {
      whereCondition.sectionId = sectionId;
    }

    const attendanceRecords = await prisma.studentAttendance.findMany({
      where: whereCondition,
      orderBy: [
        { attendanceDate: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Date,Student ID,Class ID,Section ID,Status,Notes,Attendance Taker ID,Created At\n';
      const csvData = attendanceRecords
        .map((record: any) => [
          record.attendanceDate.toISOString().split('T')[0],
          record.studentId,
          record.classId,
          record.sectionId,
          record.status,
          record.notes || '',
          record.attendanceTakerId,
          record.createdAt.toISOString(),
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const csv = csvHeader + csvData;

      const filename = `attendance_${startDate}_${endDate}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csv);
      return;
    } else {
      // Return JSON
      res.status(200).json({
        success: true,
        message: 'Attendance data exported successfully',
        data: {
          attendanceRecords,
          meta: {
            classId,
            sectionId,
            dateRange: {
              startDate,
              endDate
            },
            format,
            totalRecords: attendanceRecords.length,
            exportedAt: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error exporting attendance:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while exporting attendance data' },
      timestamp: new Date().toISOString()
    });
  }
}
