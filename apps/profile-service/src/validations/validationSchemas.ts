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
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  email: z.string().email().optional(),
  emergencyContact: z.string().optional(),
}).optional();

// Guardian schema for nested validation
const guardianSchema = z.object({
  firstName: z.string().min(1, 'Guardian first name is required').max(100),
  lastName: z.string().min(1, 'Guardian last name is required').max(100),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits').optional(),
  email: z.string().email('Invalid email format').optional(),
  relation: z.string().min(1, 'Relation is required').max(50),
  address: addressSchema,
});

export const createStudentSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  admissionNumber: z.string().min(1, 'Admission number is required').max(50),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  bloodGroup: z.string().max(10).optional(),
  category: z.string().max(50).optional(),
  religion: z.string().max(50).optional(),
  admissionDate: z.string().datetime('Invalid admission date format'),
  dateOfBirth: z.string().datetime('Invalid date of birth format').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: addressSchema,
  contactInfo: contactInfoSchema,
  profilePhoto: z.string().url('Invalid profile photo URL').max(500).optional(),
  guardians: z.array(guardianSchema).min(1, 'At least one guardian is required'),
  // Enrollment information
  classId: z.string().uuid('Invalid class ID format'),
  sectionId: z.string().uuid('Invalid section ID format'),
  academicYear: z.string().min(1, 'Academic year is required').max(20),
  rollNumber: z.string().max(50).optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  id: z.string().uuid('Invalid student ID format'),
});
