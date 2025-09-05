import { Request, Response } from 'express';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import config from '../config/config';
import axios from 'axios';
import DatabaseService from '../services/database';

const { prisma } = DatabaseService;

interface SchoolDetailedResponse {
  success: boolean;
  data?: {
    school: {
      id: string;
      name: string;
      subdomain: string;
      address: any;
      level: string;
      board: string | null;
      schoolCode: string | null;
      phoneNumbers: string[];
      email: string | null;
      principalName: string | null;
      establishedYear: number | null;
      language: string | null;
      isActive: boolean;
      metaData: any;
      fullUrl: string;
      createdAt: string;
      updatedAt: string;
    };
    classes: Array<{
      id: string;
      name: string;
      academicYear: string;
      sections: Array<{
        id: string;
        name: string;
        classTeacherId: string | null;
        metaData: any;
        createdAt: string;
        updatedAt: string;
      }>;
      subjects: Array<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        metaData: any;
        createdAt: string;
        updatedAt: string;
      }>;
      metaData: any;
      createdAt: string;
      updatedAt: string;
    }>;
    totalSections: number;
    totalSubjects: number;
    setupProgress: {
      schoolCreated: boolean;
      classesAdded: boolean;
      sectionsAdded: boolean;
      subjectsAdded: boolean;
      paymentCompleted: boolean;
    };
  };
  error?: any;
}

export async function getMySchoolDetailed(req: Request, res: Response): Promise<void> {
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

    // Get user from database to get the schoolId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { schoolId: true }
    });

    const userSchoolId = user?.schoolId;

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
      // Make internal call to school service for detailed data
      const schoolResponse = await axios.get<SchoolDetailedResponse>(
        `${config.services.school.url}/api/v1/school/get-detailed/${userSchoolId}`,
        {
          timeout: config.services.school.timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Call': 'true',
            'x-user-id': userData.id,
            'x-user-role-id': userData.roleId,
            'x-user-role-name': userData.roleName,
            'x-user-permissions': JSON.stringify(userData.permissions)
          }
        }
      );

      if (!schoolResponse.data.success || !schoolResponse.data.data) {
        res.status(404).json({
          success: false,
          error: {
            message: 'School detailed data not found',
            code: 'SCHOOL_NOT_FOUND'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const detailedData = schoolResponse.data.data;

      // Format response for frontend
      res.status(200).json({
        success: true,
        data: {
          school: {
            id: detailedData.school.id,
            name: detailedData.school.name,
            subdomain: detailedData.school.subdomain,
            address: detailedData.school.address,
            level: detailedData.school.level,
            board: detailedData.school.board,
            schoolCode: detailedData.school.schoolCode,
            phoneNumbers: detailedData.school.phoneNumbers,
            email: detailedData.school.email,
            principalName: detailedData.school.principalName,
            establishedYear: detailedData.school.establishedYear,
            language: detailedData.school.language,
            isActive: detailedData.school.isActive,
            metaData: detailedData.school.metaData,
            fullUrl: detailedData.school.fullUrl,
            createdAt: detailedData.school.createdAt,
            updatedAt: detailedData.school.updatedAt,
          },
          classes: detailedData.classes,
          totalSections: detailedData.totalSections,
          totalSubjects: detailedData.totalSubjects,
          setupProgress: detailedData.setupProgress
        },
        timestamp: new Date().toISOString()
      });

    } catch (schoolServiceError: any) {
      console.error('[AUTH SERVICE] Error calling school service for detailed data:', schoolServiceError);
      
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
          message: 'Failed to retrieve detailed school information',
          code: 'SCHOOL_SERVICE_ERROR'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

  } catch (error) {
    console.error('[AUTH SERVICE] Error in getMySchoolDetailed:', error);
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
