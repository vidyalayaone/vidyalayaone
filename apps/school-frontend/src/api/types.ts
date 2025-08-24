// TypeScript interfaces for API responses and data models

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
  medicalInfo?: MedicalInfo;
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
  fatherEmail?: string;
  fatherOccupation?: string;
  motherName: string;
  motherPhone?: string;
  motherEmail?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: string;
}

export interface MedicalInfo {
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  doctorName?: string;
  doctorPhone?: string;
  healthInsurance?: string;
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
  medicalInfo?: MedicalInfo;
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
