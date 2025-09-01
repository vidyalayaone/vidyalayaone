import { Request, Response } from 'express';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import config from '../config/config';
import axios from 'axios';
import DatabaseService from '../services/database';

const { prisma } = DatabaseService;

interface SchoolResponse {
  success: boolean;
  data?: {
    school: {
      id: string;
      name: string;
      email: string | null;
      phoneNumbers: string[];
      address: {
        city: string;
        state: string;
      } | null;
      isActive: boolean;
      metaData: any;
    };
  };
  error?: any;
}

export async function getMySchool(req: Request, res: Response): Promise<void> {
  try {
    const { context } = getSchoolContext(req);
    const userData = getUser(req);
    const userId = userData?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { 
          message: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get user from database to get the schoolId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { schoolId: true }
    });

    const userSchoolId = user?.schoolId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { 
          message: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // This endpoint should only be used in platform context
    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { 
          message: 'This endpoint is only available in platform context',
          code: 'INVALID_CONTEXT'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!userSchoolId) {
      res.status(404).json({
        success: false,
        error: {
          message: 'No school associated with this user',
          code: 'SCHOOL_NOT_FOUND'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      // Make internal call to school service with user headers
      const schoolResponse = await axios.get<SchoolResponse>(
        `${config.services.school.url}/api/v1/school/get-by-id/${userSchoolId}`,
        {
          timeout: config.services.school.timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Call': 'true', // Mark as internal call
            // Pass user headers for authorization
            'x-user-id': userData.id,
            'x-user-role-id': userData.roleId,
            'x-user-role-name': userData.roleName,
            'x-user-permissions': JSON.stringify(userData.permissions)
          }
        }
      );

      if (!schoolResponse.data.success || !schoolResponse.data.data?.school) {
        res.status(404).json({
          success: false,
          error: {
            message: 'School not found',
            code: 'SCHOOL_NOT_FOUND'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const school = schoolResponse.data.data.school;
      
      // Extract plan information from metaData if available
      const metaData = school.metaData || {};
      const plan = metaData.plan || null;

      // Format response for frontend
      res.status(200).json({
        success: true,
        data: {
          school: {
            id: school.id,
            name: school.name,
            email: school.email,
            phone: school.phoneNumbers || [],
            city: school.address?.city || '',
            state: school.address?.state || '',
            isActive: school.isActive,
            plan: plan
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (schoolServiceError: any) {
      console.error('[AUTH SERVICE] Error calling school service:', schoolServiceError);
      
      if (schoolServiceError.response?.status === 404) {
        res.status(404).json({
          success: false,
          error: {
            message: 'School not found',
            code: 'SCHOOL_NOT_FOUND'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve school information',
          code: 'SCHOOL_SERVICE_ERROR'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

  } catch (error) {
    console.error('[AUTH SERVICE] Error in getMySchool:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
