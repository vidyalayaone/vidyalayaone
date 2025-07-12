// validationSchemas.ts
import { z } from 'zod';

// Register input validation schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN']).refine(val => val === 'ADMIN', {
    message: 'Role must be ADMIN'
  })
});

// Alternative approach using z.literal for single value
export const registerSchemaAlt = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.literal('ADMIN')
});

// For login, if you need multiple roles:
export const loginSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Role is required')
}).refine(data => data.email || data.username, {
  message: 'Either email or username is required',
  path: ['email']
});

// Other schemas remain the same...
export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().min(4, 'OTP must be at least 4 characters').max(6, 'OTP must not exceed 6 characters')
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(10, 'Invalid refresh token format')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Invalid refresh token format')
});

export const testEmailSchema = z.object({
  email: z.string().email('Invalid email format')
});

// import { z } from 'zod';
//
// // Register input validation schema
// export const registerSchema = z.object({
//   email: z.string().email('Invalid email format'),
//   username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   role: z.enum(['ADMIN'], { errorMap: () => ({ message: 'Role must be ADMIN' }) })
// });
//
// // Verify OTP input validation schema
// export const verifyOtpSchema = z.object({
//   email: z.string().email('Invalid email format'),
//   otp: z.string().min(4, 'OTP must be at least 4 characters').max(6, 'OTP must not exceed 6 characters')
// });
//
// // Login input validation schema
// export const loginSchema = z.object({
//   email: z.string().email('Invalid email format').optional(),
//   username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters').optional(),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   role: z.string().min(1, 'Role is required')
// }).refine(data => data.email || data.username, {
//   message: 'Either email or username is required',
//   path: ['email']
// });
//
// // Logout input validation schema
// export const logoutSchema = z.object({
//   refreshToken: z.string().min(10, 'Invalid refresh token format')
// });
//
// // Refresh token input validation schema
// export const refreshTokenSchema = z.object({
//   refreshToken: z.string().min(10, 'Invalid refresh token format')
// });
//
// // Test email input validation schema
// export const testEmailSchema = z.object({
//   email: z.string().email('Invalid email format')
// });
