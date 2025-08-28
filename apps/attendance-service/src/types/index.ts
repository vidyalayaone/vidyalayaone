import type { AttendanceRecord } from '../generated/client';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AttendanceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Attendance specific types
export interface AttendanceRecordWithStudent extends AttendanceRecord {
  student?: {
    id: string;
    name: string;
    rollNumber: string;
  };
}

export interface AttendanceStatsResponse {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  medicalLeaveCount: number;
  attendancePercentage: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface AttendanceExportData {
  attendanceRecords: AttendanceRecord[];
  meta: {
    classId: string;
    sectionId: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    format: 'csv' | 'excel';
    totalRecords: number;
  };
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  attendancePercentage: number;
}

export interface StudentAttendanceSummary extends AttendanceSummary {
  studentId: string;
  studentName?: string;
}

export interface TeacherAttendanceSummary extends AttendanceSummary {
  teacherId: string;
  teacherName?: string;
  halfDays: number;
}

export interface AttendanceFilters {
  schoolId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  page?: number;
  limit?: number;
}

export interface StudentAttendanceFilters extends AttendanceFilters {
  studentId?: string;
  classId?: string;
  sectionId?: string;
}

export interface TeacherAttendanceFilters extends AttendanceFilters {
  teacherId?: string;
}

// External service types (references to other services)
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  schoolId: string;
}

export interface StudentInfo {
  id: string;
  name: string;
  rollNumber: string;
  classId: string;
  sectionId: string;
  schoolId: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  schoolId: string;
}

export interface TeacherInfo {
  id: string;
  name: string;
  schoolId: string;
}

export interface School {
  id: string;
  name: string;
  subdomain: string;
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  schoolId: string;
  sections: SectionInfo[];
}

export interface Section {
  id: string;
  name: string;
  classId: string;
}

export interface SectionInfo {
  id: string;
  name: string;
  classId: string;
  studentCount: number;
}

// Auth types
export interface AuthenticatedUser {
  id: string;
  schoolId: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  permissions: string[];
}

// Request extension for auth
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
