import { z } from 'zod';

export const registerSchema = z.object({
  phone: z.string().regex(/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits'),
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

export const verifyOtpForPasswordResetSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters'),
  otp: z.string().min(4, 'OTP must be at least 4 characters').max(6, 'OTP must not exceed 6 characters')
});
