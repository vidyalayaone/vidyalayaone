import { z } from 'zod';

// Attendance status enum
export const AttendanceStatusEnum = z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'MEDICAL_LEAVE']);

// Mark attendance schema
export const markAttendanceSchema = z.object({
  body: z.object({
    classId: z.string().min(1, 'Class ID is required'),
    sectionId: z.string().min(1, 'Section ID is required'),
    attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    attendanceRecords: z.array(z.object({
      studentId: z.string().min(1, 'Student ID is required'),
      status: AttendanceStatusEnum,
      notes: z.string().optional(),
    })).min(1, 'At least one attendance record is required'),
  }),
});

// Get class attendance schema
export const getClassAttendanceSchema = z.object({
  params: z.object({
    classId: z.string().min(1, 'Class ID is required'),
    sectionId: z.string().min(1, 'Section ID is required'),
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  }),
});

// Get student attendance schema
export const getStudentAttendanceSchema = z.object({
  params: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
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
    classId: z.string().min(1, 'Class ID is required'),
    sectionId: z.string().min(1, 'Section ID is required'),
  }),
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  }),
});

// Export attendance schema
export const exportAttendanceSchema = z.object({
  query: z.object({
    classId: z.string().min(1, 'Class ID is required'),
    sectionId: z.string().min(1, 'Section ID is required'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
    format: z.enum(['csv', 'excel']).default('csv'),
  }),
});

// Update attendance schema
export const updateAttendanceSchema = z.object({
  params: z.object({
    recordId: z.string().min(1, 'Record ID is required'),
  }),
  body: z.object({
    status: AttendanceStatusEnum,
    notes: z.string().optional(),
  }),
});

// Type exports
export type MarkAttendanceRequest = z.infer<typeof markAttendanceSchema>;
export type GetClassAttendanceRequest = z.infer<typeof getClassAttendanceSchema>;
export type GetStudentAttendanceRequest = z.infer<typeof getStudentAttendanceSchema>;
export type GetAttendanceStatsRequest = z.infer<typeof getAttendanceStatsSchema>;
export type ExportAttendanceRequest = z.infer<typeof exportAttendanceSchema>;
export type UpdateAttendanceRequest = z.infer<typeof updateAttendanceSchema>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusEnum>;
