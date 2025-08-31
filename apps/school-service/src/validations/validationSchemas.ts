import { z } from 'zod';

// Address schema for structured address validation
const addressSchema = z.object({
  address1: z.string().min(1, 'Address line 1 is required').max(255, 'Address line 1 too long'),
  address2: z.string().max(255, 'Address line 2 too long').optional(),
  locality: z.string().min(1, 'Locality is required').max(100, 'Locality too long'),
  city: z.string().min(1, 'City is required').max(100, 'City too long'),
  state: z.string().min(1, 'State is required').max(100, 'State too long'),
  country: z.string().min(1, 'Country is required').max(100, 'Country too long'),
  pinCode: z.string().regex(/^\d{4,10}$/, 'Pin code must be 4-10 digits'),
  landmark: z.string().max(255, 'Landmark too long').optional(),
});

// Phone number validation for array
const phoneNumberSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// School level enum validation - Fixed the enum definition
const schoolLevelSchema = z.enum(['primary', 'secondary', 'higher_secondary', 'mixed']);

// School service schemas
export const createSchoolSchema = z.object({
  name: z.string()
    .min(2, 'School name must be at least 2 characters')
    .max(255, 'School name must not exceed 255 characters')
    .trim(),
  
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .regex(/^[a-z0-9]/, 'Subdomain must start with a letter or number')
    .regex(/[a-z0-9]$/, 'Subdomain must end with a letter or number')
    .refine(val => !val.includes('--'), 'Subdomain cannot contain consecutive hyphens'),
  
  address: addressSchema,
  
  level: schoolLevelSchema,
  
  board: z.string()
    .max(255, 'Board name too long')
    .trim()
    .optional(),
  
  schoolCode: z.string()
    .min(2, 'School code must be at least 2 characters')
    .max(50, 'School code must not exceed 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'School code can only contain uppercase letters, numbers, hyphens, and underscores')
    .optional(),
  
  phoneNumbers: z.array(phoneNumberSchema)
    .min(1, 'At least one phone number is required')
    .max(5, 'Maximum 5 phone numbers allowed')
    .refine(arr => new Set(arr).size === arr.length, 'Phone numbers must be unique'),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .trim()
    .optional(),
  
  principalName: z.string()
    .min(2, 'Principal name must be at least 2 characters')
    .max(255, 'Principal name too long')
    .regex(/^[a-zA-Z\s.]+$/, 'Principal name can only contain letters, spaces, and dots')
    .trim()
    .optional(),
  
  establishedYear: z.number()
    .int('Established year must be an integer')
    .min(1800, 'Established year cannot be before 1800')
    .max(new Date().getFullYear(), 'Established year cannot be in the future')
    .optional(),
  
  language: z.string()
    .min(2, 'Language must be at least 2 characters')
    .max(50, 'Language name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Language can only contain letters and spaces')
    .trim()
    .optional(),
  
  metaData: z.record(z.string(), z.any()) // Fixed: Added key type
    .optional()
    .refine(
      (data) => !data || JSON.stringify(data).length <= 10000,
      'Metadata too large (max 10KB)'
    ),
});

export const updateSchoolSchema = z.object({
  name: z.string()
    .min(2, 'School name must be at least 2 characters')
    .max(255, 'School name must not exceed 255 characters')
    .trim()
    .optional(),
  
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .regex(/^[a-z0-9]/, 'Subdomain must start with a letter or number')
    .regex(/[a-z0-9]$/, 'Subdomain must end with a letter or number')
    .refine(val => !val.includes('--'), 'Subdomain cannot contain consecutive hyphens')
    .optional(),
  
  address: addressSchema.optional(),
  
  level: schoolLevelSchema.optional(),
  
  board: z.string()
    .max(255, 'Board name too long')
    .trim()
    .optional()
    .nullable(),
  
  schoolCode: z.string()
    .min(2, 'School code must be at least 2 characters')
    .max(50, 'School code must not exceed 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'School code can only contain uppercase letters, numbers, hyphens, and underscores')
    .optional()
    .nullable(),
  
  phoneNumbers: z.array(phoneNumberSchema)
    .min(1, 'At least one phone number is required')
    .max(5, 'Maximum 5 phone numbers allowed')
    .refine(arr => new Set(arr).size === arr.length, 'Phone numbers must be unique')
    .optional(),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .trim()
    .optional()
    .nullable(),
  
  principalName: z.string()
    .min(2, 'Principal name must be at least 2 characters')
    .max(255, 'Principal name too long')
    .regex(/^[a-zA-Z\s.]+$/, 'Principal name can only contain letters, spaces, and dots')
    .trim()
    .optional()
    .nullable(),
  
  establishedYear: z.number()
    .int('Established year must be an integer')
    .min(1800, 'Established year cannot be before 1800')
    .max(new Date().getFullYear(), 'Established year cannot be in the future')
    .optional()
    .nullable(),
  
  language: z.string()
    .min(2, 'Language must be at least 2 characters')
    .max(50, 'Language name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Language can only contain letters and spaces')
    .trim()
    .optional()
    .nullable(),
  
  metaData: z.record(z.string(), z.any()) // Fixed: Added key type
    .optional()
    .nullable()
    .refine(
      (data) => !data || JSON.stringify(data).length <= 10000,
      'Metadata too large (max 10KB)'
    ),
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
);

// Classes schema
export const createClassesSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID format'),
  classes: z.array(z.string().min(1, 'Class name cannot be empty').max(50, 'Class name too long')).min(1, 'At least one class is required'),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g., 2024-25)')
});

// Sections schema
export const createSectionsSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID format'),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g., 2024-25)'),
  sections: z.array(z.object({
    className: z.string().min(1, 'Class name cannot be empty'),
    sectionNames: z.array(z.string().min(1, 'Section name cannot be empty').max(20, 'Section name too long')).min(1, 'At least one section is required')
  })).optional()
});

// Global subjects schema
export const createGlobalSubjectsSchema = z.object({
  subjects: z.array(z.object({
    name: z.string().min(1, 'Subject name cannot be empty').max(100, 'Subject name too long'),
    code: z.string().min(1, 'Subject code cannot be empty').max(10, 'Subject code too long').regex(/^[A-Z0-9_-]+$/, 'Subject code can only contain uppercase letters, numbers, hyphens, and underscores'),
    description: z.string().max(500, 'Description too long').optional()
  })).min(1, 'At least one subject is required')
});

// Class subjects schema
export const createClassSubjectsSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID format'),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g., 2024-25)'),
  classSubjects: z.array(z.object({
    className: z.string().min(1, 'Class name cannot be empty'),
    subjectNames: z.array(z.string().min(1, 'Subject name cannot be empty')).min(1, 'At least one subject name is required')
  })).min(1, 'At least one class with subjects is required')
});

// Assign class teacher schema
export const assignClassTeacherSchema = z.object({
  sectionId: z.string().uuid('Invalid section ID format'),
  teacherId: z.string().uuid('Invalid teacher ID format')
});

// Type exports for TypeScript
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type CreateClassesInput = z.infer<typeof createClassesSchema>;
export type CreateSectionsInput = z.infer<typeof createSectionsSchema>;
export type CreateGlobalSubjectsInput = z.infer<typeof createGlobalSubjectsSchema>;
export type CreateClassSubjectsInput = z.infer<typeof createClassSubjectsSchema>;
export type AssignClassTeacherInput = z.infer<typeof assignClassTeacherSchema>;
