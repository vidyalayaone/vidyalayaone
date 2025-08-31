import axios from 'axios';
import config from '../config/config';

interface TeacherDetailsResponse {
  success: boolean;
  data?: {
    teacher: {
      id: string;
      firstName: string;
      lastName: string;
      fullName: string;
      employeeId: string;
      schoolId: string;
      gender?: string;
      joiningDate?: string;
      subjectIds?: string[];
      metaData?: any;
    };
  };
  error?: {
    message: string;
  };
  timestamp: string;
}

export class ProfileService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = config.services.profile.url;
    this.timeout = config.services.profile.timeout;
  }

  /**
   * Get teacher details from profile service
   */
  async getTeacherDetails(teacherId: string): Promise<TeacherDetailsResponse> {
    try {
      console.log(`Fetching teacher details for ID: ${teacherId} from profile service`);
      
      const response = await axios.get(
        `${this.baseUrl}/api/v1/internal/teachers/${teacherId}`,
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
      console.error('❌ Failed to fetch teacher details from profile service:', error);
      
      if (axios.isAxiosError(error)) {
        // Return structured error response
        return {
          success: false,
          error: {
            message: error.response?.data?.error?.message || 'Failed to fetch teacher details from profile service',
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        error: {
          message: 'Internal error while fetching teacher details',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const profileService = new ProfileService();
