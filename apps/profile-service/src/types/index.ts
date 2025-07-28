import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    tenantId?: string;
  };
}

export interface TenantContext {
  context: 'platform' | 'school';
  tenantId: string | null;
  tenantSlug?: string | null;
  tenantName?: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TeacherCreateInput {
  name: string;
  email: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  address?: string;
  subjects: string[];
  classes: number[];
  joiningDate?: Date;
  employmentType?: 'FULL_TIME' | 'PART_TIME';
  profilePicture?: string;
}

export interface StudentCreateInput {
  name: string;
  email: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  address?: string;
  class: number;
  section?: string;
  rollNumber?: string;
  admissionDate?: Date;
  profilePicture?: string;
}

export interface TeacherUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  address?: string;
  subjects?: string[];
  classes?: number[];
  joiningDate?: Date;
  employmentType?: 'FULL_TIME' | 'PART_TIME';
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  profilePicture?: string;
}

export interface StudentUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  address?: string;
  class?: number;
  section?: string;
  rollNumber?: string;
  admissionDate?: Date;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALUMNI';
  profilePicture?: string;
}

export interface DocumentUpload {
  name: string;
  url: string;
  type: string;
  fileSize?: number;
  mimeType?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
  message?: string;
  timestamp: string;
}

export interface QueryFilters {
  search?: string;
  status?: string;
  class?: number;
  section?: string;
  subject?: string;
  employmentType?: string;
  gender?: string;
}
