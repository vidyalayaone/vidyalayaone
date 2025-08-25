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
  secondaryPhone: z.string().optional(),
  email: z.string().email('Valid email is required'),
  emergencyContact: z.string().optional(),
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
  fatherEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  fatherOccupation: z.string().optional(),
  motherName: z.string().min(1, 'Mother name is required'),
  motherPhone: z.string().optional(),
  motherEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  motherOccupation: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
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

// Medical info schema
const medicalInfoSchema = z.object({
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  medications: z.string().optional(),
  doctorName: z.string().optional(),
  doctorPhone: z.string().optional(),
  healthInsurance: z.string().optional(),
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
  
  // Medical information
  medicalInfo: medicalInfoSchema,
  
  // Documents (optional)
  documents: z.array(documentSchema).optional(),
  
  // Enrollment information
  classId: z.string().uuid('Invalid class ID format'),
  sectionId: z.string().uuid('Invalid section ID format'),
  academicYear: z.string().min(1, 'Academic year is required').max(20),
  rollNumber: z.string().max(50).optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  id: z.string().uuid('Invalid student ID format'),
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
  
  // Documents (optional)
  documents: z.array(documentSchema).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial().extend({
  id: z.string().uuid('Invalid teacher ID format'),
});
