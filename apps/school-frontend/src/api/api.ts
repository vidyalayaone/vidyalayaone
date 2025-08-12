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
  PaginationParams
} from './types';

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

  refreshToken: async (request: RefreshTokenRequest): Promise<APIResponse<{ accessToken: string, refreshToken: string }>> => {
    try {
      const response = await httpClient.post('/auth/refresh', request);
      return handleResponse<{ accessToken: string, refreshToken: string }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

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
    try {
      const response = await httpClient.get('/dashboard/admin/stats');
      return handleResponse<AdminStats>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getTeacherStats: async (): Promise<APIResponse<TeacherStats>> => {
    try {
      const response = await httpClient.get('/dashboard/teacher/stats');
      return handleResponse<TeacherStats>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getStudentStats: async (): Promise<APIResponse<StudentStats>> => {
    try {
      const response = await httpClient.get('/dashboard/student/stats');
      return handleResponse<StudentStats>(response);
    } catch (error) {
      return handleError(error);
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

  // Students endpoints
   getStudents: async (params?: PaginationParams): Promise<APIResponse<PaginatedResponse<User>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString()); // Fix: Remove the extra .limit      
      const response = await httpClient.get(`/users/students?${queryParams.toString()}`);
      return handleResponse<PaginatedResponse<User>>(response);
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
} = api;
