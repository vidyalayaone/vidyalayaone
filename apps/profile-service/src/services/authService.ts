import axios from 'axios';
import config from '../config/config';

export interface CreateUserRequest {
  name: string;
  email: string;
  username: string;
  phone: string;
  role: 'TEACHER' | 'STUDENT';
  tenantId: string;
}

export interface CreateUserResponse {
  success: boolean;
  data: {
    userId: string;
    username: string;
    temporaryPassword: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  data: {
    temporaryPassword: string;
  };
}

class AuthService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.services.auth.url;
    this.timeout = config.services.auth.timeout;
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/auth/create-user`,
        userData,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Auth service create user failed:', error.message);
      throw new Error('Failed to create user account');
    }
  }

  async resetUserPassword(userId: string, tenantId: string): Promise<ResetPasswordResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/auth/reset-password`,
        { userId, tenantId },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Auth service reset password failed:', error.message);
      throw new Error('Failed to reset user password');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await axios.get(
        `${this.baseUrl}/api/v1/auth/validate`,
        {
          timeout: this.timeout,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();
