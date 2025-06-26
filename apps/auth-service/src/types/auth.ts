export interface User {
  id: string;
  email: string;
  password: string;
  isVerified: boolean;
  loginAttempts: number;
  lockoutUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OTP {
  id: string;
  email: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  userId?: string | null;
}

export interface RefreshToken {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userId: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}
