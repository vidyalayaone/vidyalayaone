import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendanceService';
import {
  markAttendanceSchema,
  getClassAttendanceSchema,
  getStudentAttendanceSchema,
  getAttendanceStatsSchema,
  updateAttendanceSchema,
  exportAttendanceSchema,
} from '../validations/attendanceSchemas';

// Mark attendance for a class
export const markAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request
    const validatedData = markAttendanceSchema.parse({
      body: req.body,
    });

    const { classId, sectionId, attendanceDate, attendanceRecords } = validatedData.body;
    
    // Get user info from auth middleware (assuming it's added to req.user)
    const attendanceTakerId = (req as any).user?.id;
    const schoolId = (req as any).user?.schoolId;

    if (!attendanceTakerId || !schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result = await attendanceService.markAttendance(
      classId,
      sectionId,
      attendanceDate,
      attendanceRecords,
      attendanceTakerId,
      schoolId
    );

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        attendanceRecords: result,
        summary: {
          totalRecords: result.length,
          date: attendanceDate,
          classId,
          sectionId,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get class attendance
export const getClassAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = getClassAttendanceSchema.parse({
      params: req.params,
      query: req.query,
    });

    const { classId, sectionId } = validatedData.params;
    const { date, startDate, endDate } = validatedData.query;

    const records = await attendanceService.getClassAttendance(
      classId,
      sectionId,
      date,
      startDate,
      endDate
    );

    return res.status(200).json({
      success: true,
      message: 'Class attendance retrieved successfully',
      data: {
        attendanceRecords: records,
        meta: {
          totalRecords: records.length,
          classId,
          sectionId,
          filters: { date, startDate, endDate },
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get student attendance
export const getStudentAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = getStudentAttendanceSchema.parse({
      params: req.params,
      query: req.query,
    });

    const { studentId } = validatedData.params;
    const { startDate, endDate, limit = 50, offset = 0 } = validatedData.query;

    const result = await attendanceService.getStudentAttendance(
      studentId,
      startDate,
      endDate,
      limit,
      offset
    );

    return res.status(200).json({
      success: true,
      message: 'Student attendance retrieved successfully',
      data: {
        attendanceRecords: result.records,
        pagination: {
          total: result.total,
          limit,
          offset,
          hasMore: result.total > offset + limit,
        },
        meta: {
          studentId,
          filters: { startDate, endDate },
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get attendance statistics
export const getAttendanceStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = getAttendanceStatsSchema.parse({
      params: req.params,
      query: req.query,
    });

    const { classId, sectionId } = validatedData.params;
    const { startDate, endDate } = validatedData.query;

    const stats = await attendanceService.getAttendanceStats(
      classId,
      sectionId,
      startDate,
      endDate
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    return next(error);
  }
};

// Update attendance record
export const updateAttendanceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = updateAttendanceSchema.parse({
      params: req.params,
      body: req.body,
    });

    const { recordId } = validatedData.params;
    const { status, notes } = validatedData.body;

    const updatedRecord = await attendanceService.updateAttendanceRecord(
      recordId,
      status,
      notes
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: {
        attendanceRecord: updatedRecord,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Export attendance data
export const exportAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = exportAttendanceSchema.parse({
      query: req.query,
    });

    const { classId, sectionId, startDate, endDate, format } = validatedData.query;

    const records = await attendanceService.getAttendanceForExport(
      classId,
      sectionId,
      startDate,
      endDate
    );

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Student ID,Date,Status,Notes,Marked By,Created At\n';
      const csvData = records
        .map(record => [
          record.studentId,
          record.attendanceDate.toISOString().split('T')[0],
          record.status,
          record.notes || '',
          record.attendanceTakerId,
          record.createdAt.toISOString(),
        ].map(field => `"${field}"`).join(','))
        .join('\n');

      const csv = csvHeader + csvData;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance_${classId}_${startDate}_${endDate}.csv"`);
      return res.status(200).send(csv);
    } else {
      // Return JSON for Excel processing on frontend
      return res.status(200).json({
        success: true,
        message: 'Attendance data exported successfully',
        data: {
          attendanceRecords: records,
          meta: {
            classId,
            sectionId,
            dateRange: { startDate, endDate },
            format,
            totalRecords: records.length,
          },
        },
      });
    }
  } catch (error) {
    return next(error);
  }
};
