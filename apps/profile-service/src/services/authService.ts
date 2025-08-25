import axios from 'axios';
import config from '../config/config';

interface CreateUserRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  schoolId: string;
  roleName?: string;
}

interface CreateUserResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      schoolId: string;
      isActive: boolean;
    };
  };
  error?: {
    message: string;
  };
  timestamp: string;
}

export class AuthService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = config.services.auth.url;
    this.timeout = config.services.auth.timeout;
  }

  /**
   * Create a new user in the auth service for student
   */
  async createUserForStudent(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/internal/create-user-for-student`,
        {
          ...userData,
          roleName: userData.roleName || 'STUDENT', // Default to STUDENT role
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Request': 'true', // Mark as internal service request
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Failed to create user in auth service:', error);
      
      if (axios.isAxiosError(error)) {
        // Return structured error response
        return {
          success: false,
          error: {
            message: error.response?.data?.error?.message || 'Failed to create user in auth service',
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        error: {
          message: 'Internal error while creating user',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Create a new user in the auth service for teacher
   */
  async createUserForTeacher(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/internal/create-user-for-teacher`,
        {
          ...userData,
          roleName: userData.roleName || 'TEACHER', // Default to TEACHER role
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Request': 'true', // Mark as internal service request
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Failed to create user in auth service:', error);
      
      if (axios.isAxiosError(error)) {
        // Return structured error response
        return {
          success: false,
          error: {
            message: error.response?.data?.error?.message || 'Failed to create user in auth service',
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        error: {
          message: 'Internal error while creating user',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Delete a user from auth service (for rollback scenarios)
   */
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    try {
      await axios.delete(
        `${this.baseUrl}/api/v1/internal/users/${userId}`,
        {
          timeout: this.timeout,
          headers: {
            'X-Internal-Request': 'true',
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete user from auth service:', error);
      return { success: false };
    }
  }
}

export const authService = new AuthService();
