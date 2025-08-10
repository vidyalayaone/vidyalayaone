// TypeScript interfaces for API responses and data models

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  avatar?: string;
  phoneNumber?: string;
  schoolId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  subdomain: string;
  schoolCode: string;
  address: any;
  level: string;
  board: string;
  schoolCode: string;
  phoneNumbers: string[];
  email: string;
  principalName: string;
  establishedYear: number;
  language: string;
  metaData: any;
  full_url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings: SchoolSettings;
}

export interface SchoolSettings {
  academicYear: string;
  terms: number;
  gradeScale: 'A-F' | 'PERCENTAGE' | 'POINTS';
  attendanceRequired: boolean;
  features: {
    assignments: boolean;
    grading: boolean;
    attendance: boolean;
    messaging: boolean;
    reports: boolean;
  };
}

export interface Class {
  id: string;
  name: string;
  code: string;
  description?: string;
  teacherId: string;
  teacher: User;
  students: User[];
  subject: string;
  grade: string;
  academicYear: string;
  term: string;
  isActive: boolean;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  maxPoints: number;
  type: 'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PROJECT';
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  attachments?: string[];
  submissions: AssignmentSubmission[];
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  student: User;
  content: string;
  attachments?: string[];
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'LATE' | 'GRADED';
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
  markedBy: string;
  markedAt: string;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  school: School;
  expiresIn: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  username: string;
}

export interface VerifyOTPRequest {
  username: string;
  otp: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Dashboard Stats Types
export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  recentActivities: Activity[];
}

export interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  pendingAssignments: number;
  upcomingDeadlines: Assignment[];
  recentActivities: Activity[];
}

export interface StudentStats {
  totalClasses: number;
  pendingAssignments: number;
  averageGrade: number;
  attendanceRate: number;
  upcomingDeadlines: Assignment[];
  recentGrades: AssignmentSubmission[];
}

export interface Activity {
  id: string;
  type: 'LOGIN' | 'ASSIGNMENT_CREATED' | 'ASSIGNMENT_SUBMITTED' | 'GRADE_POSTED' | 'ATTENDANCE_MARKED';
  title: string;
  description: string;
  userId: string;
  user: User;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
