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

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
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

export interface Section {
  id: string;
  name: string;
  classId: string;
}
