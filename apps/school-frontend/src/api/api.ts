import httpClient from './httpClient';
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
  PaginatedResponse,
  PaginationParams,
  ProfileServiceStudent,
  CreateStudentRequest
} from './types';

// Import mock API for fallback
import * as mockAPI from './mockAPI';

// Helper function to check if we should use mock data
const shouldUseMockData = () => {
  // For now, always use mock data for dashboard stats since backend endpoints don't exist yet
  return true;
};

// Helper function to handle API responses
const handleResponse = <T>(response: any): APIResponse<T> => {
  return {
    success: response.data.success || true,
    data: response.data.data || response.data,
    message: response.data.message || 'Success',
    errors: response.data.errors || []
  };
};

// Helper function to handle API errors
const handleError = (error: any): APIResponse => {
  if (error.response?.data) {
    return {
      success: false,
      message: error.response.data.message || 'An error occurred',
      errors: error.response.data.errors || [error.response.data.error || 'UNKNOWN_ERROR']
    };
  }
  
  return {
    success: false,
    message: error.message || 'Network error',
    errors: ['NETWORK_ERROR']
  };
};

export const api = {
  // Authentication endpoints
  login: async (credentials: LoginRequest): Promise<APIResponse<AuthResponse>> => {
    try {
      const response = await httpClient.post('/auth/login', credentials);
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  forgotPassword: async (request: ForgotPasswordRequest): Promise<APIResponse> => {
    try {
      const response = await httpClient.post('/auth/forgot-password', request);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  verifyOTP: async (request: VerifyOTPRequest): Promise<APIResponse<{ resetToken: string }>> => {
    try {
      const response = await httpClient.post('/auth/verify-otp/password-reset', request);
      return handleResponse<{ resetToken: string }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  resetPassword: async (request: ResetPasswordRequest): Promise<APIResponse> => {
    try {
      const response = await httpClient.post('/auth/reset-password', request);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // refreshToken: async (request: RefreshTokenRequest): Promise<APIResponse<{ accessToken: string, refreshToken: string }>> => {
  //   try {
  //     const response = await httpClient.post('/auth/refresh', request);
  //     return handleResponse<{ accessToken: string, refreshToken: string }>(response);
  //   } catch (error) {
  //     return handleError(error);
  //   }
  // },

  logout: async (refreshToken: string): Promise<APIResponse> => {
    try {
      const response = await httpClient.post('/auth/logout', { refreshToken });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // User endpoints
  getMe: async (): Promise<APIResponse> => {
    try {
      const response = await httpClient.get('/auth/me');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // School endpoints
  getSchoolBySubdomain: async (subdomain: string): Promise<APIResponse> => {
    try {
      const response = await httpClient.get(`/school/get-by-subdomain/${subdomain}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Dashboard stats endpoints
  getAdminStats: async (): Promise<APIResponse<AdminStats>> => {
    // Use mock data for now since backend endpoints don't exist yet
    if (shouldUseMockData()) {
      return await mockAPI.getAdminStats();
    }
    
    try {
      const response = await httpClient.get('/dashboard/admin/stats');
      return handleResponse<AdminStats>(response);
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('API call failed, falling back to mock data:', error);
      return await mockAPI.getAdminStats();
    }
  },

  getTeacherStats: async (): Promise<APIResponse<TeacherStats>> => {
    // Use mock data for now since backend endpoints don't exist yet
    if (shouldUseMockData()) {
      return await mockAPI.getTeacherStats();
    }
    
    try {
      const response = await httpClient.get('/dashboard/teacher/stats');
      return handleResponse<TeacherStats>(response);
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('API call failed, falling back to mock data:', error);
      return await mockAPI.getTeacherStats();
    }
  },

  getStudentStats: async (): Promise<APIResponse<StudentStats>> => {
    // Use mock data for now since backend endpoints don't exist yet
    if (shouldUseMockData()) {
      return await mockAPI.getStudentStats();
    }
    
    try {
      const response = await httpClient.get('/dashboard/student/stats');
      return handleResponse<StudentStats>(response);
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('API call failed, falling back to mock data:', error);
      return await mockAPI.getStudentStats();
    }
  },

  // Classes endpoints
  getClasses: async (params?: PaginationParams): Promise<APIResponse<PaginatedResponse<Class>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await httpClient.get(`/classes?${queryParams.toString()}`);
      return handleResponse<PaginatedResponse<Class>>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getClassesAndSections: async (schoolId: string, academicYear: string = '2025-26'): Promise<APIResponse> => {
    try {
      const response = await httpClient.get(`/school/classes-sections/${schoolId}?academicYear=${academicYear}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Teachers endpoints
  getTeachers: async (params?: PaginationParams): Promise<APIResponse<PaginatedResponse<User>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await httpClient.get(`/users/teachers?${queryParams.toString()}`);
      return handleResponse<PaginatedResponse<User>>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: get all students for a school (admin only)
  getStudentsBySchool: async (options?: { academicYear?: string; category?: string; classId?: string; sectionId?: string }) : Promise<APIResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (options?.academicYear) queryParams.append('academicYear', options.academicYear);
      if (options?.category) queryParams.append('category', options.category);
      if (options?.classId) queryParams.append('classId', options.classId);
      if (options?.sectionId) queryParams.append('sectionId', options.sectionId);

      const queryString = queryParams.toString();
      const url = `/profile/schools/students${queryString ? `?${queryString}` : ''}`;
      const response = await httpClient.get(url);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: get a specific student by ID
  getStudentById: async (id: string): Promise<APIResponse<{ student: ProfileServiceStudent }>> => {
    try {
      const response = await httpClient.get(`/profile/students/${id}`);
      return handleResponse<{ student: ProfileServiceStudent }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: create a new student
  createStudent: async (data: CreateStudentRequest): Promise<APIResponse<{ student: ProfileServiceStudent }>> => {
    try {
      const response = await httpClient.post('/profile/students', data);
      return handleResponse<{ student: ProfileServiceStudent }>(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// Export individual functions for easier importing (keeping same interface)
export const {
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  // refreshToken,
  logout,
  getMe,
  getSchoolBySubdomain,
  getAdminStats,
  getTeacherStats,
  getStudentStats,
  getClasses,
  getClassesAndSections,
  getTeachers,
  getStudentsBySchool,
  getStudentById,
  createStudent
} = api;
