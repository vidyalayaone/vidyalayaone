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
  StudentApplicationsResponse,
  CreateStudentRequest,
  CreateStudentApplicationRequest,
  DeleteStudentsRequest,
  DeleteStudentsResponse,
  DeleteTeachersRequest,
  DeleteTeachersResponse,
  ProfileServiceTeachersResponse,
  ProfileServiceTeacherDetail,
  SchoolSubjectsResponse,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  CreateTeacherResponse,
  CreateDocumentRequest,
  DocumentsListResponse,
  ProfileServiceDocument
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

  // Profile service: get all teachers for a school (admin only)
  getTeachersBySchool: async (options?: { 
    category?: string; 
    gender?: string; 
    maritalStatus?: string; 
    hasSubjects?: string; 
  }): Promise<APIResponse<ProfileServiceTeachersResponse>> => {
    try {
      const queryParams = new URLSearchParams();
      if (options?.category) queryParams.append('category', options.category);
      if (options?.gender) queryParams.append('gender', options.gender);
      if (options?.maritalStatus) queryParams.append('maritalStatus', options.maritalStatus);
      if (options?.hasSubjects) queryParams.append('hasSubjects', options.hasSubjects);

      const queryString = queryParams.toString();
      const url = `/profile/schools/teachers${queryString ? `?${queryString}` : ''}`;
      const response = await httpClient.get(url);
      return handleResponse<ProfileServiceTeachersResponse>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: get a specific teacher by ID
  getTeacherById: async (id: string): Promise<APIResponse<ProfileServiceTeacherDetail>> => {
    try {
      const response = await httpClient.get(`/profile/teachers/${id}`);
      return handleResponse<ProfileServiceTeacherDetail>(response);
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

  // Profile service: create a student application (public route)
  createStudentApplication: async (data: CreateStudentApplicationRequest): Promise<APIResponse<{ student: ProfileServiceStudent }>> => {
    try {
      const response = await httpClient.post('/profile/students/apply', data);
      return handleResponse<{ student: ProfileServiceStudent }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: update an existing student
  updateStudent: async (id: string, data: Partial<CreateStudentRequest>): Promise<APIResponse<{ student: ProfileServiceStudent }>> => {
    try {
      const response = await httpClient.patch(`/profile/students/${id}`, data);
      return handleResponse<{ student: ProfileServiceStudent }>(response);
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Profile service: delete students
  deleteStudents: async (data: DeleteStudentsRequest): Promise<APIResponse<DeleteStudentsResponse>> => {
    try {
      const response = await httpClient.delete('/profile/students', {
        data: data
      });
      return handleResponse<DeleteStudentsResponse>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: delete teachers
  deleteTeachers: async (data: DeleteTeachersRequest): Promise<APIResponse<DeleteTeachersResponse>> => {
    try {
      const response = await httpClient.delete('/profile/teachers', {
        data: data
      });
      return handleResponse<DeleteTeachersResponse>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // School service: get subjects for a school
  getSchoolSubjects: async (): Promise<APIResponse<SchoolSubjectsResponse>> => {
    try {
      const response = await httpClient.get('/school/subjects');
      return handleResponse<SchoolSubjectsResponse>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: create a new teacher
  createTeacher: async (data: CreateTeacherRequest): Promise<APIResponse<CreateTeacherResponse>> => {
    try {
      const response = await httpClient.post('/profile/teachers', data);
      return handleResponse<CreateTeacherResponse>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: update an existing teacher
  updateTeacher: async (id: string, data: UpdateTeacherRequest): Promise<APIResponse<{ teacher: ProfileServiceTeacherDetail['teacher'] }>> => {
    try {
      const response = await httpClient.patch(`/profile/teachers/${id}`, data);
      return handleResponse<{ teacher: ProfileServiceTeacherDetail['teacher'] }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Section details endpoints
  getSectionDetails: async (schoolId: string, classId: string, sectionId: string): Promise<APIResponse> => {
    try {
      const response = await httpClient.get(`/school/${schoolId}/classes/${classId}/sections/${sectionId}/details`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getSectionStudents: async (schoolId: string, classId: string, sectionId: string): Promise<APIResponse> => {
    try {
      const response = await httpClient.get(`/school/${schoolId}/classes/${classId}/sections/${sectionId}/students`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getSectionTimetable: async (schoolId: string, classId: string, sectionId: string): Promise<APIResponse> => {
    try {
      const response = await httpClient.get(`/school/${schoolId}/classes/${classId}/sections/${sectionId}/timetable`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Student Documents endpoints
  createStudentDocument: async (studentId: string, data: CreateDocumentRequest): Promise<APIResponse<{ document: ProfileServiceDocument }>> => {
    try {
      const response = await httpClient.post(`/profile/students/${studentId}/documents`, data);
      return handleResponse<{ document: ProfileServiceDocument }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  uploadStudentDocument: async (studentId: string, file: File, data: { name: string; type: CreateDocumentRequest['type']; description?: string; expiryDate?: string }): Promise<APIResponse<{ document: ProfileServiceDocument }>> => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('name', data.name);
      formData.append('type', data.type);
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.expiryDate) {
        formData.append('expiryDate', data.expiryDate);
      }

      const response = await httpClient.post(`/profile/students/${studentId}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleResponse<{ document: ProfileServiceDocument }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getStudentDocuments: async (studentId: string, page: number = 1, pageSize: number = 20): Promise<APIResponse<DocumentsListResponse>> => {
    try {
      const response = await httpClient.get(`/profile/students/${studentId}/documents?page=${page}&pageSize=${pageSize}`);
      return handleResponse<DocumentsListResponse>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getStudentDocument: async (studentId: string, docId: string): Promise<APIResponse<{ document: ProfileServiceDocument }>> => {
    try {
      const response = await httpClient.get(`/profile/students/${studentId}/documents/${docId}`);
      return handleResponse<{ document: ProfileServiceDocument }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: get teacher ID for logged-in user
  getMyTeacherId: async (): Promise<APIResponse<{ teacherId: string; userId: string; schoolId: string; firstName: string; lastName: string; employeeId: string }>> => {
    try {
      const response = await httpClient.get('/profile/me/teacher-id');
      return handleResponse<{ teacherId: string; userId: string; schoolId: string; firstName: string; lastName: string; employeeId: string }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Attendance service: mark attendance
  markAttendance: async (data: {
    classId: string;
    sectionId: string;
    attendanceDate: string;
    attendanceTakerId: string;
    attendanceRecords: Array<{
      studentId: string;
      status: 'PRESENT' | 'ABSENT' | 'LEAVE';
      notes?: string;
    }>;
  }): Promise<APIResponse<{ recordsCreated: number; classId: string; sectionId: string; attendanceDate: string; attendanceTaker: string }>> => {
    try {
      const response = await httpClient.post('/attendance/mark', data);
      return handleResponse<{ recordsCreated: number; classId: string; sectionId: string; attendanceDate: string; attendanceTaker: string }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: get student applications by status
  getStudentApplications: async (): Promise<APIResponse<StudentApplicationsResponse>> => {
    try {
      const response = await httpClient.get('/profile/schools/student-applications');
      return handleResponse<StudentApplicationsResponse>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: get specific student application by ID
  getStudentApplication: async (id: string): Promise<APIResponse<{ student: ProfileServiceStudent }>> => {
    try {
      const response = await httpClient.get(`/profile/student-applications/${id}`);
      return handleResponse<{ student: ProfileServiceStudent }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: accept student application
  acceptStudentApplication: async (id: string, data: {
    admissionNumber: string;
    admissionDate: string;
    classId: string;
    sectionId: string;
    rollNumber?: string;
  }): Promise<APIResponse<{ student: ProfileServiceStudent; enrollment: any; userCreated: boolean; message: string }>> => {
    try {
      const response = await httpClient.post(`/profile/student-applications/${id}/accept`, data);
      return handleResponse<{ student: ProfileServiceStudent; enrollment: any; userCreated: boolean; message: string }>(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Profile service: reject student application
  rejectStudentApplication: async (id: string, data?: { reason?: string }): Promise<APIResponse<{ student: ProfileServiceStudent; message: string }>> => {
    try {
      const response = await httpClient.post(`/profile/student-applications/${id}/reject`, data || {});
      return handleResponse<{ student: ProfileServiceStudent; message: string }>(response);
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
  getTeachersBySchool,
  getTeacherById,
  getStudentsBySchool,
  getStudentById,
  createStudent,
  createStudentApplication,
  updateStudent,
  deleteStudents,
  deleteTeachers,
  getSchoolSubjects,
  createTeacher,
  updateTeacher,
  getSectionDetails,
  getSectionStudents,
  getSectionTimetable,
  createStudentDocument,
  uploadStudentDocument,
  getStudentDocuments,
  getStudentDocument,
  getMyTeacherId,
  markAttendance,
  getStudentApplications,
  getStudentApplication,
  acceptStudentApplication,
  rejectStudentApplication
} = api;
