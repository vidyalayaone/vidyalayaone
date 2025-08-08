// Mock API implementation with realistic data and network delays

import {
  APIResponse,
  AuthResponse,
  User,
  School,
  AdminStats,
  TeacherStats,
  StudentStats,
  LoginRequest,
  ForgotPasswordRequest,
  VerifyOTPRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  Class,
  Assignment,
  AttendanceRecord,
  PaginatedResponse,
  PaginationParams
} from './types';

// Mock data
const mockSchool: School = {
  id: 'school-1',
  name: 'Riverside Academy',
  subdomain: 'riverside',
  logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&h=100&fit=crop',
  address: '123 Education Blvd, Learning City, LC 12345',
  phoneNumber: '(555) 123-4567',
  email: 'info@riverside-academy.edu',
  website: 'https://riverside-academy.edu',
  timezone: 'America/New_York',
  isActive: true,
  settings: {
    academicYear: '2024-2025',
    terms: 4,
    gradeScale: 'A-F',
    attendanceRequired: true,
    features: {
      assignments: true,
      grading: true,
      attendance: true,
      messaging: true,
      reports: true
    }
  }
};

const mockUsers: User[] = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@riverside-academy.edu',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68d8e66?w=100&h=100&fit=crop',
    phoneNumber: '(555) 123-4567',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'teacher-1',
    username: 'teacher',
    email: 'mwilson@riverside-academy.edu',
    firstName: 'Michael',
    lastName: 'Wilson',
    role: 'TEACHER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    phoneNumber: '(555) 234-5678',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 'student-1',
    username: 'student',
    email: 'edavis@student.riverside-academy.edu',
    firstName: 'Emma',
    lastName: 'Davis',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    phoneNumber: '(555) 345-6789',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-02-01T14:15:00Z',
    updatedAt: '2024-02-01T14:15:00Z'
  }
];

const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Advanced Mathematics',
    code: 'MATH401',
    description: 'Advanced calculus and mathematical analysis',
    teacherId: 'teacher-1',
    teacher: mockUsers[1],
    students: [mockUsers[2]],
    subject: 'Mathematics',
    grade: '12',
    academicYear: '2024-2025',
    term: 'Fall',
    isActive: true,
    createdAt: '2024-08-15T09:00:00Z'
  },
  {
    id: 'class-2',
    name: 'Physics Laboratory',
    code: 'PHYS301',
    description: 'Hands-on physics experiments and lab work',
    teacherId: 'teacher-1',
    teacher: mockUsers[1],
    students: [mockUsers[2]],
    subject: 'Physics',
    grade: '11',
    academicYear: '2024-2025',
    term: 'Fall',
    isActive: true,
    createdAt: '2024-08-15T10:00:00Z'
  }
];

// Utility function to simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock tokens
const generateToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Mock API implementation
export const mockAPI = {
  // Authentication endpoints
  login: async (credentials: LoginRequest): Promise<APIResponse<AuthResponse>> => {
    await delay(400);
    
    const user = mockUsers.find(u => u.username === credentials.username);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid username or password',
        errors: ['USER_NOT_FOUND']
      };
    }
    
    // Mock password validation (in real app, this would be hashed)
    if (credentials.password !== 'password123') {
      return {
        success: false,
        message: 'Invalid username or password',
        errors: ['INVALID_CREDENTIALS']
      };
    }
    
    const authResponse: AuthResponse = {
      accessToken: generateToken(64),
      refreshToken: generateToken(64),
      user,
      school: mockSchool,
      expiresIn: 3600 // 1 hour
    };
    
    return {
      success: true,
      data: authResponse,
      message: 'Login successful'
    };
  },

  forgotPassword: async (request: ForgotPasswordRequest): Promise<APIResponse> => {
    await delay(500);
    
    const user = mockUsers.find(u => u.username === request.username);
    
    if (!user) {
      return {
        success: false,
        message: 'Username not found',
        errors: ['USER_NOT_FOUND']
      };
    }
    
    return {
      success: true,
      message: 'OTP sent to your registered phone number'
    };
  },

  verifyOTP: async (request: VerifyOTPRequest): Promise<APIResponse<{ resetToken: string }>> => {
    await delay(300);
    
    // Mock OTP validation (in real app, this would check against sent OTP)
    if (request.otp !== '123456') {
      return {
        success: false,
        message: 'Invalid OTP',
        errors: ['INVALID_OTP']
      };
    }
    
    return {
      success: true,
      data: { resetToken: generateToken(32) },
      message: 'OTP verified successfully'
    };
  },

  resetPassword: async (request: ResetPasswordRequest): Promise<APIResponse> => {
    await delay(400);
    
    if (request.newPassword !== request.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
        errors: ['PASSWORD_MISMATCH']
      };
    }
    
    if (request.newPassword.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long',
        errors: ['PASSWORD_TOO_SHORT']
      };
    }
    
    return {
      success: true,
      message: 'Password reset successfully'
    };
  },

  refreshToken: async (request: RefreshTokenRequest): Promise<APIResponse<{ accessToken: string }>> => {
    await delay(200);
    
    return {
      success: true,
      data: { accessToken: generateToken(64) },
      message: 'Token refreshed successfully'
    };
  },

  logout: async (refreshToken: string): Promise<APIResponse> => {
    await delay(200);
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  },

  // User endpoints
  getMe: async (): Promise<APIResponse<User>> => {
    await delay(200);
    
    // In real app, this would decode the JWT token
    return {
      success: true,
      data: mockUsers[0] // Return current user based on token
    };
  },

  // School endpoints
  getSchoolBySubdomain: async (subdomain: string): Promise<APIResponse<School>> => {
    await delay(300);
    
    return {
      success: true,
      data: mockSchool
    };
  },

  // Dashboard stats endpoints
  getAdminStats: async (): Promise<APIResponse<AdminStats>> => {
    await delay(400);
    
    const stats: AdminStats = {
      totalStudents: 1250,
      totalTeachers: 85,
      totalClasses: 240,
      activeClasses: 180,
      recentActivities: [
        {
          id: 'activity-1',
          type: 'ASSIGNMENT_CREATED',
          title: 'New Assignment Created',
          description: 'Michael Wilson created a new assignment in Advanced Mathematics',
          userId: 'teacher-1',
          user: mockUsers[1],
          createdAt: '2024-08-08T10:30:00Z'
        }
      ]
    };
    
    return {
      success: true,
      data: stats
    };
  },

  getTeacherStats: async (): Promise<APIResponse<TeacherStats>> => {
    await delay(400);
    
    const stats: TeacherStats = {
      totalClasses: 6,
      totalStudents: 150,
      pendingAssignments: 3,
      upcomingDeadlines: [],
      recentActivities: [
        {
          id: 'activity-2',
          type: 'ASSIGNMENT_SUBMITTED',
          title: 'Assignment Submitted',
          description: 'Emma Davis submitted Calculus Problem Set #3',
          userId: 'student-1',
          user: mockUsers[2],
          createdAt: '2024-08-08T09:45:00Z'
        }
      ]
    };
    
    return {
      success: true,
      data: stats
    };
  },

  getStudentStats: async (): Promise<APIResponse<StudentStats>> => {
    await delay(400);
    
    const stats: StudentStats = {
      totalClasses: 7,
      pendingAssignments: 2,
      averageGrade: 87.5,
      attendanceRate: 96.2,
      upcomingDeadlines: [],
      recentGrades: []
    };
    
    return {
      success: true,
      data: stats
    };
  },

  // Classes endpoints
  getClasses: async (params?: PaginationParams): Promise<APIResponse<PaginatedResponse<Class>>> => {
    await delay(300);
    
    const response: PaginatedResponse<Class> = {
      data: mockClasses,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockClasses.length,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
    
    return {
      success: true,
      data: response
    };
  },

  // Teachers endpoints
  getTeachers: async (params?: PaginationParams): Promise<APIResponse<PaginatedResponse<User>>> => {
    await delay(300);
    
    const teachers = mockUsers.filter(u => u.role === 'TEACHER');
    const response: PaginatedResponse<User> = {
      data: teachers,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: teachers.length,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
    
    return {
      success: true,
      data: response
    };
  },

  // Students endpoints
  getStudents: async (params?: PaginationParams): Promise<APIResponse<PaginatedResponse<User>>> => {
    await delay(300);
    
    const students = mockUsers.filter(u => u.role === 'STUDENT');
    const response: PaginatedResponse<User> = {
      data: students,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: students.length,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
    
    return {
      success: true,
      data: response
    };
  }
};

// Export individual API functions for easier importing
export const {
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  refreshToken,
  logout,
  getMe,
  getSchoolBySubdomain,
  getAdminStats,
  getTeacherStats,
  getStudentStats,
  getClasses,
  getTeachers,
  getStudents
} = mockAPI;