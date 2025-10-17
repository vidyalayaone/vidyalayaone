import { z } from 'zod';

// Address schema for nested validation
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
}).optional();

// Contact info schema for nested validation
const contactInfoSchema = z.object({
  primaryPhone: z.string().regex(/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits'),
  email: z.string().email('Valid email is required'),
});

// Guardian schema for nested validation
const guardianSchema = z.object({
  firstName: z.string().min(1, 'Guardian first name is required').max(100),
  lastName: z.string().min(1, 'Guardian last name is required').max(100),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits').optional(),
  email: z.string().email('Invalid email format').optional(),
  relation: z.string().min(1, 'Relation is required').max(50),
  address: addressSchema,
});

// Parent info schema for easier frontend mapping
const parentInfoSchema = z.object({
  fatherName: z.string().min(1, 'Father name is required'),
  fatherPhone: z.string().optional(),
  motherName: z.string().min(1, 'Mother name is required'),
  motherPhone: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianRelation: z.string().optional(),
});

// Document schema for file uploads
const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Document type is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSize: z.number().optional(),
  base64Data: z.string().optional(), // For handling file uploads
}).optional();

export const createStudentSchema = z.object({
  // Basic student information (no userId - will be created internally)
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  admissionNumber: z.string().min(1, 'Admission number is required').max(50),
  bloodGroup: z.string().max(10).optional(),
  category: z.string().max(50).optional(),
  religion: z.string().max(50).optional(),
  admissionDate: z.string().datetime('Invalid admission date format'),
  dateOfBirth: z.string().datetime('Invalid date of birth format').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: addressSchema,
  contactInfo: contactInfoSchema,
  profilePhoto: z.string().url('Invalid profile photo URL').max(500).optional(),
  
  // Parent/Guardian information (using both schemas for flexibility)
  parentInfo: parentInfoSchema.optional(), // For easier frontend mapping
  guardians: z.array(guardianSchema).optional(), // For direct guardian data
  
  // Documents (optional)
  documents: z.array(documentSchema).optional(),
  
  // Enrollment information
  classId: z.string().uuid('Invalid class ID format'),
  sectionId: z.string().uuid('Invalid section ID format'),
  academicYear: z.string().min(1, 'Academic year is required').max(20),
  rollNumber: z.string().max(50).optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  // Make id optional since it should come from URL params, not the request body
  id: z.string().uuid('Invalid student ID format').optional(),
});

export const acceptStudentApplicationSchema = z.object({
  admissionNumber: z.string().min(1, 'Admission number is required').max(50),
  admissionDate: z.string().datetime('Invalid admission date format'),
  classId: z.string().uuid('Invalid class ID format'),
  sectionId: z.string().uuid('Invalid section ID format'),
  rollNumber: z.string().max(50).optional(),
});

export const rejectStudentApplicationSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(500).optional(),
});

// Teacher validation schemas
export const createTeacherSchema = z.object({
  // Basic teacher information (no userId - will be created internally)
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  employeeId: z.string().min(1, 'Employee ID is required').max(50),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().max(10).optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
  dateOfBirth: z.string().datetime('Invalid date of birth format').optional(),
  category: z.string().max(50).optional(),
  religion: z.string().max(50).optional(),
  qualifications: z.string().max(255).optional(),
  experienceYears: z.number().int().min(0).optional(),
  joiningDate: z.string().datetime('Invalid joining date format').optional(),
  salary: z.number().positive().optional(),
  address: addressSchema,
  subjectIds: z.array(z.string().uuid('Invalid subject ID format')).optional(),
  
  // Contact information
  phoneNumber: z.string().regex(/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits'),
  email: z.string().email('Valid email is required'),
  
  // Documents (optional)
  documents: z.array(documentSchema).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial().extend({
  // Make id optional since it should come from URL params, not the request body
  id: z.string().uuid('Invalid teacher ID format').optional(),
});

// Document validation schemas
export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255),
  type: z.enum([
    'BIRTH_CERTIFICATE',
    'AADHAAR_CARD',
    'PAN_CARD',
    'PASSPORT',
    'VOTER_ID',
    'DRIVING_LICENSE',
    'MARK_SHEET',
    'DEGREE_CERTIFICATE',
    'DIPLOMA_CERTIFICATE',
    'TRANSFER_CERTIFICATE',
    'CHARACTER_CERTIFICATE',
    'EXPERIENCE_CERTIFICATE',
    'MEDICAL_CERTIFICATE',
    'VACCINATION_RECORD',
    'HEALTH_CHECKUP_REPORT',
    'INCOME_CERTIFICATE',
    'FEE_RECEIPT',
    'SALARY_SLIP',
    'BANK_STATEMENT',
    'PHOTO',
    'SIGNATURE',
    'CASTE_CERTIFICATE',
    'DOMICILE_CERTIFICATE',
    'RESIDENCE_PROOF',
    'OTHER'
  ], 'Invalid document type'),
  url: z.string().url('Valid URL is required').max(500),
  description: z.string().max(1000).optional(),
  mimeType: z.string().min(1, 'MIME type is required').max(100).optional(),
  fileSize: z.number().int().min(0).optional(),
  expiryDate: z.string().datetime('Invalid expiry date format').optional(),
});

// Schema for file upload without URL (file will be uploaded to cloud)
export const uploadDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255),
  type: z.enum([
    'BIRTH_CERTIFICATE',
    'AADHAAR_CARD',
    'PAN_CARD',
    'PASSPORT',
    'VOTER_ID',
    'DRIVING_LICENSE',
    'MARK_SHEET',
    'DEGREE_CERTIFICATE',
    'DIPLOMA_CERTIFICATE',
    'TRANSFER_CERTIFICATE',
    'CHARACTER_CERTIFICATE',
    'EXPERIENCE_CERTIFICATE',
    'MEDICAL_CERTIFICATE',
    'VACCINATION_RECORD',
    'HEALTH_CHECKUP_REPORT',
    'INCOME_CERTIFICATE',
    'FEE_RECEIPT',
    'SALARY_SLIP',
    'BANK_STATEMENT',
    'PHOTO',
    'SIGNATURE',
    'CASTE_CERTIFICATE',
    'DOMICILE_CERTIFICATE',
    'RESIDENCE_PROOF',
    'OTHER'
  ], 'Invalid document type'),
  description: z.string().max(1000).optional(),
  expiryDate: z.string().datetime('Invalid expiry date format').optional(),
});

export const listDocumentsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  pageSize: z.string().regex(/^\d+$/, 'Page size must be a number').optional(),
});

export const documentParamsSchema = z.object({
  id: z.string().uuid('Invalid student ID format'),
  docId: z.string().uuid('Invalid document ID format').optional(),
});

// Delete students validation schema
export const deleteStudentsSchema = z.object({
  studentIds: z.array(z.string().uuid('Invalid student ID format'))
    .min(1, 'At least one student ID is required')
    .max(100, 'Cannot delete more than 100 students at once'),
});

// Delete teachers validation schema
export const deleteTeachersSchema = z.object({
  teacherIds: z.array(z.string().uuid('Invalid teacher ID format'))
    .min(1, 'At least one teacher ID is required')
    .max(100, 'Cannot delete more than 100 teachers at once'),
});
