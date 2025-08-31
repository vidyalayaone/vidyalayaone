export interface Teacher {
  id: string;
  userId: string;
  schoolId: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  address?: string;
  qualification?: string;
  experience?: number;
  joiningDate?: Date;
  designation?: string;
  department?: string;
  salary?: number;
  isActive: boolean;
  profilePicture?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  schoolId: string;
  admissionNumber?: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  address?: string;
  class?: string;
  section?: string;
  academicYear?: string;
  admissionDate?: Date;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  isActive: boolean;
  profilePicture?: string;
  bloodGroup?: string;
  transportInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}
