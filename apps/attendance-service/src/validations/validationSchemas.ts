import { z } from 'zod';

// Common validation schemas
export const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LEAVE']);
export const teacherAttendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LEAVE', 'HALF_DAY']);

// Student attendance validation schemas
export const createStudentAttendanceSchema = z.object({
  studentId: z.string().uuid('Student ID must be a valid UUID'),
  schoolId: z.string().uuid('School ID must be a valid UUID'),
  attendanceDate: z.coerce.date(),
  status: attendanceStatusSchema,
  attendanceTakerId: z.string().uuid('Attendance taker ID must be a valid UUID'),
  metaData: z.record(z.string(), z.any()).optional()
});

export const updateStudentAttendanceSchema = z.object({
  status: attendanceStatusSchema.optional(),
  attendanceTakerId: z.string().uuid('Attendance taker ID must be a valid UUID').optional(),
  metaData: z.record(z.string(), z.any()).optional()
});

export const getStudentAttendanceSchema = z.object({
  studentId: z.string().uuid().optional(),
  schoolId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: attendanceStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

// Teacher attendance validation schemas
export const createTeacherAttendanceSchema = z.object({
  teacherId: z.string().uuid('Teacher ID must be a valid UUID'),
  schoolId: z.string().uuid('School ID must be a valid UUID'),
  attendanceDate: z.coerce.date(),
  status: teacherAttendanceStatusSchema,
  metaData: z.record(z.string(), z.any()).optional()
});

export const updateTeacherAttendanceSchema = z.object({
  status: teacherAttendanceStatusSchema.optional(),
  metaData: z.record(z.string(), z.any()).optional()
});

export const getTeacherAttendanceSchema = z.object({
  teacherId: z.string().uuid().optional(),
  schoolId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: teacherAttendanceStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

// Bulk attendance operations
export const bulkStudentAttendanceSchema = z.object({
  schoolId: z.string().uuid('School ID must be a valid UUID'),
  attendanceDate: z.coerce.date(),
  attendanceTakerId: z.string().uuid('Attendance taker ID must be a valid UUID'),
  attendanceRecords: z.array(z.object({
    studentId: z.string().uuid('Student ID must be a valid UUID'),
    status: attendanceStatusSchema,
    metaData: z.record(z.string(), z.any()).optional()
  })).min(1, 'At least one attendance record is required')
});

export const bulkTeacherAttendanceSchema = z.object({
  schoolId: z.string().uuid('School ID must be a valid UUID'),
  attendanceDate: z.coerce.date(),
  attendanceRecords: z.array(z.object({
    teacherId: z.string().uuid('Teacher ID must be a valid UUID'),
    status: teacherAttendanceStatusSchema,
    metaData: z.record(z.string(), z.any()).optional()
  })).min(1, 'At least one attendance record is required')
});
