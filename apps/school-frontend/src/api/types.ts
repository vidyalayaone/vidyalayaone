// TypeScript interfaces for API responses and data models

// Profile Service Student interfaces (from backend Prisma schema)
export interface ProfileServiceGuardian {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: any;
  metaData?: any;
}

export interface ProfileServiceStudentGuardian {
  id: string;
  relation?: string;
  guardian: ProfileServiceGuardian;
  metaData?: any;
}

export interface ProfileServiceStudentEnrollment {
  id: string;
  classId: string;
  sectionId: string;
  academicYear: string;
  rollNumber?: string;
  isCurrent: boolean;
  fromDate?: string;
  toDate?: string;
  metaData?: any;
  className?: string; // Added by backend
  sectionName?: string; // Added by backend
}

export interface ProfileServiceDocument {
  id: string;
  name: string;
  description?: string;
  type: string;
  url: string;
  mimeType: string;
  fileSize?: number;
  isVerified: boolean;
  expiryDate?: string;
  uploadedBy?: string;
  metaData?: any;
  createdAt: string;
  updatedAt: string;
}

// Document API types
export interface CreateDocumentRequest {
  name: string;
  type: 'BIRTH_CERTIFICATE' | 'AADHAAR_CARD' | 'PAN_CARD' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE' | 
        'MARK_SHEET' | 'DEGREE_CERTIFICATE' | 'DIPLOMA_CERTIFICATE' | 'TRANSFER_CERTIFICATE' | 
        'CHARACTER_CERTIFICATE' | 'EXPERIENCE_CERTIFICATE' | 'MEDICAL_CERTIFICATE' | 'VACCINATION_RECORD' | 
        'HEALTH_CHECKUP_REPORT' | 'INCOME_CERTIFICATE' | 'FEE_RECEIPT' | 'SALARY_SLIP' | 'BANK_STATEMENT' | 
        'PHOTO' | 'SIGNATURE' | 'CASTE_CERTIFICATE' | 'DOMICILE_CERTIFICATE' | 'RESIDENCE_PROOF' | 'OTHER';
  url: string;
  description?: string;
  mimeType?: string;
  fileSize?: number;
  expiryDate?: string;
}

export interface UploadDocumentRequest {
  name: string;
  type: 'BIRTH_CERTIFICATE' | 'AADHAAR_CARD' | 'PAN_CARD' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE' | 
        'MARK_SHEET' | 'DEGREE_CERTIFICATE' | 'DIPLOMA_CERTIFICATE' | 'TRANSFER_CERTIFICATE' | 
        'CHARACTER_CERTIFICATE' | 'EXPERIENCE_CERTIFICATE' | 'MEDICAL_CERTIFICATE' | 'VACCINATION_RECORD' | 
        'HEALTH_CHECKUP_REPORT' | 'INCOME_CERTIFICATE' | 'FEE_RECEIPT' | 'SALARY_SLIP' | 'BANK_STATEMENT' | 
        'PHOTO' | 'SIGNATURE' | 'CASTE_CERTIFICATE' | 'DOMICILE_CERTIFICATE' | 'RESIDENCE_PROOF' | 'OTHER';
  description?: string;
  expiryDate?: string;
}

// Delete students API types
export interface DeleteStudentsRequest {
  studentIds: string[];
}

export interface DeleteStudentsResponse {
  summary: {
    totalRequested: number;
    successfulDeletions: number;
    failedDeletions: number;
    deletedUsers: number;
    failedUserDeletions: number;
  };
  results: {
    deletedStudents: string[];
    failedDeletions: Array<{
      studentId: string;
      error: string;
    }>;
    deletedUsers: string[];
    failedUserDeletions: Array<{
      userId: string;
      error: string;
    }>;
  };
  message: string;
}

export interface DocumentsListResponse {
  documents: ProfileServiceDocument[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ProfileServiceStudent {
  id: string;
  userId: string;
  admissionNumber: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  bloodGroup?: string;
  category?: string;
  religion?: string;
  admissionDate: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: any;
  contactInfo?: any;
  profilePhoto?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  metaData?: any;
  guardians: ProfileServiceStudentGuardian[];
  enrollments: ProfileServiceStudentEnrollment[];
  documents: ProfileServiceDocument[];
  createdAt: string;
  updatedAt: string;
}

// Student Applications Response
export interface StudentApplicationsResponse {
  acceptedStudents: ProfileServiceStudent[];
  rejectedStudents: ProfileServiceStudent[];
  pendingStudents: ProfileServiceStudent[];
  summary: {
    totalAccepted: number;
    totalRejected: number;
    totalPending: number;
    totalApplications: number;
  };
  schoolId: string;
}

// User interface for authentication and user management
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  roleName?: string; // For backwards compatibility with JWT
  avatar?: string;
  phoneNumber?: string;
  schoolId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: string[]; // JWT permissions array
}

// Teacher-specific interfaces
export interface Teacher extends Omit<User, 'role'> {
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  employeeId: string;
  joiningDate: string;
  qualification: string;
  experience: number; // years of experience
  subjects: Subject[];
  classes: ClassAssignment[];
  address: Address;
  emergencyContact: EmergencyContact;
  salary?: number;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  religion?: string;
  category?: string;
}

// Profile Service Teacher interface (matches backend response)
export interface ProfileServiceTeacher {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  dateOfBirth?: string;
  category?: string;
  religion?: string;
  qualifications?: string;
  experienceYears?: number;
  joiningDate?: string;
  salary?: number;
  address?: any;
  subjectIds: string[];
  subjects: {
    id: string;
    name: string;
    code: string;
  }[];
  documentCount: number;
  verifiedDocumentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Teachers response from profile service
export interface ProfileServiceTeachersResponse {
  teachers: ProfileServiceTeacher[];
  summary: {
    totalTeachers: number;
    genderDistribution: {
      male: number;
      female: number;
      other: number;
      unspecified: number;
    };
    maritalStatusDistribution: {
      single: number;
      married: number;
      divorced: number;
      widowed: number;
      unspecified: number;
    };
    subjectAssignment: {
      withSubjects: number;
      withoutSubjects: number;
    };
    experienceDistribution: {
      fresher: number;
      experienced: number;
      senior: number;
      expert: number;
    };
  };
  filters: {
    category: string;
    gender: string;
    maritalStatus: string;
    hasSubjects: string;
  };
}

// Single teacher response from profile service
export interface ProfileServiceTeacherDetail {
  teacher: {
    id: string;
    userId: string;
    employeeId: string;
    schoolId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    bloodGroup?: string;
    maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    dateOfBirth?: string;
    category?: string;
    religion?: string;
    qualifications?: string;
    experienceYears?: number;
    joiningDate?: string;
    salary?: number;
    address?: any;
    subjectIds: string[];
    subjects: {
      id: string;
      name: string;
      code: string;
    }[];
    documents: {
      id: string;
      name: string;
      description?: string;
      type: string;
      url: string;
      mimeType: string;
      fileSize?: number;
      isVerified: boolean;
      expiryDate?: string;
      metaData?: any;
      createdAt: string;
      updatedAt: string;
    }[];
    metaData?: any;
    createdAt: string;
    updatedAt: string;
  };
  userDetails?: {
    username: string;
    email: string;
    phone?: string;
    isActive: boolean;
    lastLogin?: string;
  } | null;
}

// Student-specific interfaces
export interface Student extends Omit<User, 'role'> {
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  studentId: string;
  enrollmentDate: string;
  currentClass: StudentClass;
  parentGuardian: ParentGuardian;
  address: Address;
  emergencyContact: EmergencyContact;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  documents: StudentDocument[];
  academicHistory: AcademicRecord[];
  feeStatus: FeeStatus;
}

export interface StudentClass {
  id: string;
  grade: string;
  section: string;
  className: string;
  academicYear: string;
}

export interface ParentGuardian {
  fatherName: string;
  fatherPhone?: string;
  motherName: string;
  motherPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
}

export interface StudentDocument {
  id: string;
  type: 'BIRTH_CERTIFICATE' | 'ID_PROOF' | 'ADDRESS_PROOF' | 'PHOTO' | 'MEDICAL_CERTIFICATE' | 'TRANSFER_CERTIFICATE' | 'OTHER';
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface AcademicRecord {
  id: string;
  academicYear: string;
  grade: string;
  section: string;
  subjects: SubjectGrade[];
  attendance: number; // percentage
  overallGrade: string;
  rank?: number;
  remarks?: string;
}

export interface SubjectGrade {
  subject: Subject;
  grade: string;
  marks: number;
  maxMarks: number;
  percentage: number;
}

export interface FeeStatus {
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  transactions: FeeTransaction[];
}

export interface FeeTransaction {
  id: string;
  amount: number;
  type: 'PAYMENT' | 'REFUND';
  method: 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE';
  transactionId?: string;
  date: string;
  remarks?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface ClassAssignment {
  id: string;
  classId: string;
  className: string;
  grade: string;
  section: string;
  subject: Subject;
  isClassTeacher: boolean; // if this teacher is the main class teacher
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

// Teacher form data interfaces
export interface CreateTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  joiningDate: string;
  qualification: string;
  experience: number;
  subjectIds: string[];
  classAssignments: {
    classId: string;
    subjectId: string;
    isClassTeacher: boolean;
  }[];
  address: Address;
  emergencyContact: EmergencyContact;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  id: string;
}

// Student form data interfaces
export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  studentId: string;
  enrollmentDate: string;
  classId: string;
  grade: string;
  section: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address: Address;
  parentGuardian: ParentGuardian;
  emergencyContact: EmergencyContact;
  documents?: File[];
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  id: string;
}

// Teacher activity log
export interface TeacherActivity {
  id: string;
  teacherId: string;
  type: 'LOGIN' | 'CLASS_ASSIGNED' | 'CLASS_REMOVED' | 'PROFILE_UPDATED' | 'PASSWORD_RESET';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  subdomain: string;
  schoolCode: string;
  address: any;
  level: string;
  board: string;
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

// Student creation request interface
export interface CreateStudentRequest {
  // Basic student information (no userId - will be created internally)
  firstName: string;
  lastName: string;
  admissionNumber: string;
  bloodGroup?: string;
  category?: string;
  religion?: string;
  admissionDate: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  contactInfo: {
    primaryPhone: string; // Required for user account creation
    email: string; // Required for user account creation
  };
  profilePhoto?: string;
  
  // Parent/Guardian information (using parent info format for easier frontend mapping)
  parentInfo?: {
    fatherName: string;
    fatherPhone?: string;
    motherName: string;
    motherPhone?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianRelation?: string;
  };
  
  // Documents (optional)
  documents?: {
    name: string;
    description?: string;
    type: string;
    mimeType: string;
    fileSize?: number;
    base64Data?: string;
  }[];
  
  // Enrollment information
  classId: string;
  sectionId: string;
  academicYear: string;
  rollNumber?: string;
}

// Student application request without class enrollment
export interface CreateStudentApplicationRequest {
  // Basic student information (no userId - will be created internally)
  firstName: string;
  lastName: string;
  admissionNumber?: string;
  bloodGroup?: string;
  category?: string;
  religion?: string;
  admissionDate?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  contactInfo: {
    primaryPhone: string; // Required for user account creation
    email: string; // Required for user account creation
  };
  profilePhoto?: string;
  
  // Parent/Guardian information (using parent info format for easier frontend mapping)
  parentInfo?: {
    fatherName: string;
    fatherPhone?: string;
    motherName: string;
    motherPhone?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianRelation?: string;
  };
  
  // Documents (optional)
  documents?: {
    name: string;
    description?: string;
    type: string;
    mimeType: string;
    fileSize?: number;
    base64Data?: string;
  }[];
  
  // Note: No enrollment information required for applications
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

// School Service: Get subjects response
export interface SchoolSubjectsResponse {
  school: {
    id: string;
    name: string;
  };
  subjects: Subject[];
  totalSubjects: number;
}

// Profile Service: Create teacher request and response
export interface CreateTeacherRequest {
  firstName: string;
  lastName: string;
  employeeId: string;
  phoneNumber: string;
  email: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  dateOfBirth?: string;
  category?: string;
  religion?: string;
  qualifications?: string;
  experienceYears?: number;
  joiningDate?: string;
  salary?: number;
  address?: any;
  subjectIds?: string[];
}

export interface CreateTeacherResponse {
  teacher: ProfileServiceTeacherDetail;
  credentials: {
    username: string;
    temporaryPassword: string;
  };
}

// Update teacher request (all fields optional)
export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {}

// Delete Teachers Request and Response
export interface DeleteTeachersRequest {
  teacherIds: string[];
}

export interface DeleteTeachersResponse {
  summary: {
    totalRequested: number;
    successfulDeletions: number;
    failedDeletions: number;
  };
  results: {
    deletedTeachers: string[];
    failedTeachers: {
      teacherId: string;
      reason: string;
    }[];
  };
  errors?: string[];
}

// Assign class teacher types
export interface AssignClassTeacherRequest {
  sectionId: string;
  teacherId: string;
}

export interface AssignClassTeacherResponse {
  section: {
    id: string;
    name: string;
    classTeacherId: string;
    class: {
      id: string;
      name: string;
      academicYear: string;
    };
    school: {
      id: string;
      name: string;
    };
  };
}
