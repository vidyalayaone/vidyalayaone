import axios, { AxiosResponse } from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vidyalaya_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('vidyalaya_refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await api.post('/auth/refresh-token', { refreshToken });
          if (refreshResponse.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
            localStorage.setItem('vidyalaya_access_token', accessToken);
            localStorage.setItem('vidyalaya_refresh_token', newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('vidyalaya_access_token');
          localStorage.removeItem('vidyalaya_refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      // No refresh token, redirect to login
      localStorage.removeItem('vidyalaya_access_token');
      localStorage.removeItem('vidyalaya_refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  username: string;
  roleId: string;
  roleName: string;
  verified?: boolean;
}

export interface School {
  id: string;
  name: string;
  type: string;
  address: string;
  principalName: string;
  contactEmail: string;
  contactPhone: string;
  affiliatedBoard: string;
  studentStrength: number;
  planType?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  subdomain?: string;
}

export interface ClassSection {
  class: string;
  sections: string[];
}

export interface Subject {
  class: string;
  section: string;
  subjects: string[];
}

// Backend response types
interface BackendResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: string;
  };
  timestamp: string;
}

// Auth API
export const authAPI = {
  register: async (data: { username: string; phone: string; password: string }) => {
    const response: AxiosResponse<BackendResponse<{ user_id: string; phone: string }>> = await api.post('/auth/register', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Registration failed');
    }
    return response.data;
  },

  resendOTP: async (username: string, purpose: 'registration' | 'password_reset') => {
    const response: AxiosResponse<BackendResponse> = await api.post('/auth/resend-otp', { username, purpose });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to resend OTP');
    }
    return response.data;
  },

  verifyRegistrationOTP: async (data: { username: string; otp: string }) => {
    const response: AxiosResponse<BackendResponse> = await api.post('/auth/verify-otp/registration', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'OTP verification failed');
    }
    return response.data;
  },

  login: async (data: { username: string; password: string }) => {
    const response: AxiosResponse<BackendResponse<{ accessToken: string; refreshToken: string; user: { id: string; roleId: string; roleName: string; username: string } }>> = await api.post('/auth/login', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Login failed');
    }
    return response.data;
  },

  forgotPassword: async (username: string) => {
    const response: AxiosResponse<BackendResponse> = await api.post('/auth/forgot-password', { username });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to send reset code');
    }
    return response.data;
  },

  verifyPasswordResetOTP: async (data: { username: string; otp: string }) => {
    const response: AxiosResponse<BackendResponse<{ resetToken: string }>> = await api.post('/auth/verify-otp/password-reset', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'OTP verification failed');
    }
    return response.data;
  },

  resetPassword: async (data: { resetToken: string; newPassword: string }) => {
    const response: AxiosResponse<BackendResponse> = await api.post('/auth/reset-password', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Password reset failed');
    }
    return response.data;
  },

  getMe: async () => {
    const response: AxiosResponse<BackendResponse<User>> = await api.get('/auth/me');
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch user data');
    }
    return response.data;
  },

  getMySchool: async () => {
    const response: AxiosResponse<BackendResponse<{ school: School | null }>> = await api.get('/auth/my-school');
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch school data');
    }
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response: AxiosResponse<BackendResponse> = await api.post('/auth/logout', { refreshToken });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Logout failed');
    }
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response: AxiosResponse<BackendResponse<{ accessToken: string; refreshToken: string }>> = await api.post('/auth/refresh-token', { refreshToken });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Token refresh failed');
    }
    return response.data;
  },
};

// School API
export const schoolAPI = {
  create: async (data: Omit<School, 'id' | 'approvalStatus' | 'subdomain'>) => {
    const response: AxiosResponse<{ school: School }> = await api.post('/school/create', data);
    return response.data;
  },

  updatePlan: async (schoolId: string, planType: string) => {
    const response: AxiosResponse<{ school: School }> = await api.patch(`/school/${schoolId}/plan`, { planType });
    return response.data;
  },

  addClasses: async (data: { schoolId: string; classes: string[] }) => {
    const response: AxiosResponse<{ message: string }> = await api.post('/school/classes', data);
    return response.data;
  },

  addSections: async (data: { schoolId: string; sections: ClassSection[] }) => {
    const response: AxiosResponse<{ message: string }> = await api.post('/school/sections', data);
    return response.data;
  },

  getClassesSections: async (schoolId: string) => {
    const response: AxiosResponse<{ classesSections: ClassSection[] }> = await api.get(`/school/classes-sections/${schoolId}`);
    return response.data;
  },

  getSubjects: async () => {
    const response: AxiosResponse<{ subjects: Record<string, string[]> }> = await api.get('/school/subjects');
    return response.data;
  },

  addSubjects: async (data: { schoolId: string; subjects: Subject[] }) => {
    const response: AxiosResponse<{ message: string }> = await api.post('/school/subjects', data);
    return response.data;
  },
};

// Contact API
export const contactAPI = {
  submit: async (data: { name: string; email: string; school: string; message: string }) => {
    const response: AxiosResponse<{ message: string }> = await api.post('/contact', data);
    return response.data;
  },
};