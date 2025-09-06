import { email, z } from 'zod';

export const registerSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must not exceed 15 digits').optional(),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const resendOtpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  purpose: z.enum(['registration', 'password_reset'])
});

export const verifyOtpForRegistrationSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  otp: z.string().min(4, 'OTP must be at least 4 characters').max(6, 'OTP must not exceed 6 characters')
});

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string()
});

export const forgotPasswordSchema = z.object({
  username: z.string().min(3).max(50),
});

export const verifyOtpForPasswordResetSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  otp: z.string().min(4, 'OTP must be at least 4 characters').max(6, 'OTP must not exceed 6 characters')
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(10),
  newPassword: z.string().min(6),
});
   

export const logoutSchema = z.object({
  refreshToken: z.string()
});

export const updateAdminWithSchoolIdSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID format').optional(),
  userId: z.string().uuid('Invalid user ID format')
});

export const seedRolesSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID format'),
  roles: z.array(z.object({
    name: z.string().min(1, 'Role name is required').max(50, 'Role name must not exceed 50 characters'),
    description: z.string().optional(),
    permissions: z.array(z.string()).min(1, 'At least one permission is required')
  })).min(1, 'At least one role is required')
});