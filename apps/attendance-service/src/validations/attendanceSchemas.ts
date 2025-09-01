import { z } from 'zod';

// Attendance status enum to match Prisma schema
export const AttendanceStatusEnum = z.enum(['PRESENT', 'ABSENT', 'LEAVE']);

// Mark attendance schema
export const markAttendanceSchema = z.object({
  body: z.object({
    classId: z.string().uuid('Class ID must be a valid UUID'),
    sectionId: z.string().uuid('Section ID must be a valid UUID'),
    attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    attendanceTakerId: z.string().uuid('Teacher ID must be a valid UUID'),
    attendanceRecords: z.array(z.object({
      studentId: z.string().uuid('Student ID must be a valid UUID'),
      status: AttendanceStatusEnum,
      notes: z.string().optional(),
    })).min(1, 'At least one attendance record is required'),
  }),
});

// Get class attendance schema
export const getClassAttendanceSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Class ID must be a valid UUID'),
    sectionId: z.string().uuid('Section ID must be a valid UUID'),
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  }),
});

// Get class attendance range schema (optimized for date ranges)
export const getClassAttendanceRangeSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Class ID must be a valid UUID'),
    sectionId: z.string().uuid('Section ID must be a valid UUID'),
  }),
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  }).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before or equal to end date',
    path: ['startDate']
  }).refine(data => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 90;
  }, {
    message: 'Date range cannot exceed 90 days',
    path: ['endDate']
  }),
});

// Get student attendance schema
export const getStudentAttendanceSchema = z.object({
  params: z.object({
    studentId: z.string().uuid('Student ID must be a valid UUID'),
  }),
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
    limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
    offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0, 'Offset must be 0 or greater').optional(),
  }),
});

// Get attendance statistics schema
export const getAttendanceStatsSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Class ID must be a valid UUID'),
    sectionId: z.string().uuid('Section ID must be a valid UUID'),
  }),
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  }),
});

// Export attendance schema
export const exportAttendanceSchema = z.object({
  query: z.object({
    classId: z.string().uuid('Class ID must be a valid UUID').optional(),
    sectionId: z.string().uuid('Section ID must be a valid UUID').optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
    format: z.enum(['csv', 'json']).default('json'),
  }),
});

// Update attendance schema
export const updateAttendanceSchema = z.object({
  params: z.object({
    recordId: z.string().uuid('Record ID must be a valid UUID'),
  }),
  body: z.object({
    status: AttendanceStatusEnum.optional(),
    notes: z.string().optional(),
  }),
});

// Type exports
export type MarkAttendanceRequest = z.infer<typeof markAttendanceSchema>;
export type GetClassAttendanceRequest = z.infer<typeof getClassAttendanceSchema>;
export type GetClassAttendanceRangeRequest = z.infer<typeof getClassAttendanceRangeSchema>;
export type GetStudentAttendanceRequest = z.infer<typeof getStudentAttendanceSchema>;
export type GetAttendanceStatsRequest = z.infer<typeof getAttendanceStatsSchema>;
export type ExportAttendanceRequest = z.infer<typeof exportAttendanceSchema>;
export type UpdateAttendanceRequest = z.infer<typeof updateAttendanceSchema>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusEnum>;
