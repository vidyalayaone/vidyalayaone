import { useAuthStore } from '@/store/authStore';
import axios, { AxiosResponse } from 'axios';

// Base API configuration
let API_BASE_URL;

if (window.location.origin.includes("localhost")) {
  API_BASE_URL = "http://localhost:3000/api/v1";
} else {
  API_BASE_URL = `${window.location.origin}/api/v1`;

}

// console.log(API_BASE_URL);

// const API_BASE_URL = 'https://vidyalayaone.com/api/v1';
// const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  // Get auth store dynamically to avoid circular dependency
  const authStore = (window as any).__AUTH_STORE__;
  const token = authStore?.getState?.()?.accessToken || localStorage.getItem('vidyalaya_access_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration and logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 unauthorized - token expired
    if (error.response?.status === 401) {
      // Token expired, logout user from both frontend and backend
      const { logout } = useAuthStore();
      await logout();
      return Promise.reject(error);
    }
    
    // For other HTTP status codes, check if we have a valid backend response format
    if (error.response?.data && typeof error.response.data === 'object' && 'success' in error.response.data) {
      // This is a valid backend response, not a network error
      // Return it as a successful response so our API functions can handle the success/failure logic
      return Promise.resolve(error.response);
    }
    
    // For actual network errors or malformed responses, reject as usual
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
  subdomain?: string;
  address: {
    address1: string;
    address2?: string;
    locality: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    landmark?: string;
  };
  level: 'primary' | 'secondary' | 'higher_secondary' | 'mixed';
  board?: string;
  schoolCode?: string;
  phoneNumbers: string[];
  email?: string;
  principalName?: string;
  establishedYear?: number;
  language?: string;
  isActive: boolean;
  metaData?: {
    plan?: {
      type: string;
      features: string[];
      maxStudents?: number;
      expiresAt?: string;
    };
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    studentStrength?: number;
    [key: string]: any;
  };
  fullUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DetailedSchoolData {
  school: School;
  classes: SchoolClass[];
  totalSections: number;
  totalSubjects: number;
  setupProgress: {
    schoolCreated: boolean;
    classesAdded: boolean;
    sectionsAdded: boolean;
    subjectsAdded: boolean;
    paymentCompleted: boolean;
  };
}

export interface SchoolClass {
  id: string;
  name: string;
  academicYear: string;
  sections: SchoolSection[];
  subjects: SchoolSubject[];
  metaData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolSection {
  id: string;
  name: string;
  classTeacherId?: string;
  metaData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolSubject {
  id: string;
  name: string;
  code: string;
  description?: string;
  metaData?: any;
  createdAt: string;
  updatedAt: string;
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
  register: async (data: { username: string; email: string; password: string }) => {
    const response: AxiosResponse<BackendResponse<{ user_id: string; email: string }>> = await api.post('/auth/register', data);
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
    return response;
  },

  getMySchool: async () => {
    const response: AxiosResponse<BackendResponse<{ school: School | null }>> = await api.get('/auth/my-school');
    if (!response.data.success) {
      // For 404, it's expected that school might not exist
      if (response.status === 404) {
        return response.data; // Return the response as is for 404
      }
      throw new Error(response.data.error?.message || 'Failed to fetch school data');
    }
    return response.data;
  },

  getMySchoolDetailed: async () => {
    const response: AxiosResponse<BackendResponse<DetailedSchoolData>> = await api.get('/auth/my-school-detailed');
    if (!response.data.success) {
      // For 404, it's expected that school might not exist
      if (response.status === 404) {
        return response.data; // Return the response as is for 404
      }
      throw new Error(response.data.error?.message || 'Failed to fetch detailed school data');
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
  create: async (data: Omit<School, 'id' | 'isActive' | 'fullUrl' | 'createdAt' | 'updatedAt'>) => {
    const response: AxiosResponse<BackendResponse<{ school: School }>> = await api.post('/school/create', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to create school');
    }
    return response.data.data;
  },

  updatePlan: async (schoolId: string, planType: string) => {
    const response: AxiosResponse<BackendResponse<{ school: School }>> = await api.patch(`/school/${schoolId}/plan`, { planType });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to update plan');
    }
    return response.data.data;
  },

  addClasses: async (data: { schoolId: string; classes: string[]; academicYear: string }) => {
    const response: AxiosResponse<BackendResponse> = await api.post('/school/classes', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to add classes');
    }
    return response.data;
  },

  addSections: async (data: { schoolId: string; academicYear: string; sections: Array<{ className: string; sectionNames: string[] }> }) => {
    const response: AxiosResponse<BackendResponse> = await api.post('/school/sections', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to add sections');
    }
    return response.data;
  },

  getClassesSections: async (schoolId: string, academicYear?: string) => {
    const params = academicYear ? `?academicYear=${academicYear}` : '';
    const response: AxiosResponse<BackendResponse<{ 
      school: { id: string; name: string };
      academicYear: string;
      classes: Array<{
        id: string;
        name: string;
        sections: Array<{
          id: string;
          name: string;
          createdAt: string;
          updatedAt: string;
        }>;
        subjects: Array<{
          id: string;
          name: string;
          code: string;
        }>;
        createdAt: string;
        updatedAt: string;
      }>;
      totalClasses: number;
      totalSections: number;
    }>> = await api.get(`/school/classes-sections/${schoolId}${params}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch classes and sections');
    }
    return response.data;
  },

  getSubjects: async () => {
    const response: AxiosResponse<BackendResponse<{ subjects: Record<string, string[]> }>> = await api.get('/school/subjects');
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch subjects');
    }
    return response.data;
  },

  getGlobalSubjects: async () => {
    const response: AxiosResponse<BackendResponse<{ 
      subjects: Array<{
        id: string;
        name: string;
        code: string;
        description?: string;
      }>;
      totalSubjects: number;
    }>> = await api.get('/school/subjects/global');
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch global subjects');
    }
    return response.data;
  },

  createClassSubjects: async (data: { 
    schoolId: string; 
    academicYear: string; 
    classSubjects: Array<{
      className: string;
      subjectNames: string[];
    }>;
  }) => {
    const response: AxiosResponse<BackendResponse> = await api.post('/school/subjects', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to create class subjects');
    }
    return response.data;
  },
};

// Contact API
export const contactAPI = {
  submit: async (data: { name: string; email: string; school: string; message: string }) => {
    const response: AxiosResponse<BackendResponse> = await api.post('/contact', data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to submit contact form');
    }
    return response.data;
  },
};
