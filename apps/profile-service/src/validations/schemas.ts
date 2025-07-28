import { z } from 'zod';

// Common schemas
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const createTeacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().max(500, 'Address too long').optional(),
  subjects: z.array(z.string()).min(1, 'At least one subject required'),
  classes: z.array(z.number().int().min(1).max(12)).min(1, 'At least one class required'),
  joiningDate: z.string().datetime().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME']).optional(),
  profilePicture: z.string().url().optional(),
});

export const updateTeacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().max(500, 'Address too long').optional(),
  subjects: z.array(z.string()).min(1, 'At least one subject required').optional(),
  classes: z.array(z.number().int().min(1).max(12)).min(1, 'At least one class required').optional(),
  joiningDate: z.string().datetime().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional(),
  profilePicture: z.string().url().optional(),
});

export const createStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().max(500, 'Address too long').optional(),
  class: z.number().int().min(1).max(12),
  section: z.string().max(10).optional(),
  rollNumber: z.string().max(50).optional(),
  admissionDate: z.string().datetime().optional(),
  profilePicture: z.string().url().optional(),
});

export const updateStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().max(500, 'Address too long').optional(),
  class: z.number().int().min(1).max(12).optional(),
  section: z.string().max(10).optional(),
  rollNumber: z.string().max(50).optional(),
  admissionDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALUMNI']).optional(),
  profilePicture: z.string().url().optional(),
});

export const updateProfileSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  profilePicture: z.string().url().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

export const queryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'ALUMNI']).optional(),
  class: z.string().regex(/^([1-9]|1[0-2])$/).optional(),
  section: z.string().max(10).optional(),
  subject: z.string().max(100).optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type QueryParams = z.infer<typeof queryParamsSchema>;
