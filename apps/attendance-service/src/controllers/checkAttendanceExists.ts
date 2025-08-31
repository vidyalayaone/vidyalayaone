import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { z } from 'zod';

const { prisma } = DatabaseService;

// Validation schema for checking attendance
const checkAttendanceExistsSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Class ID must be a valid UUID'),
    sectionId: z.string().uuid('Section ID must be a valid UUID'),
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  }),
});

export async function checkAttendanceExists(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(
      checkAttendanceExistsSchema,
      { params: req.params, query: req.query },
      res
    );
    if (!validation.success) return;

    const { classId, sectionId } = validation.data.params;
    const { date } = validation.data.query;
    const { context, schoolId } = getSchoolContext(req);

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if any attendance record exists for the given class, section, and date
    const existingAttendance = await prisma.studentAttendance.findFirst({
      where: {
        classId: classId,
        sectionId: sectionId,
        schoolId: schoolId,
        attendanceDate: new Date(date)
      }
    });

    // Count total attendance records for this class/section/date
    const attendanceCount = await prisma.studentAttendance.count({
      where: {
        classId: classId,
        sectionId: sectionId,
        schoolId: schoolId,
        attendanceDate: new Date(date)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Attendance check completed successfully',
      data: {
        attendanceExists: !!existingAttendance,
        attendanceCount,
        date,
        classId,
        sectionId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking attendance existence:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while checking attendance' },
      timestamp: new Date().toISOString()
    });
  }
}
