import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import config from "../config/config";
import axios from 'axios';
import { createSchoolSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function createSchool(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(createSchoolSchema, req.body, res);
    if (!validation.success) return;

    const { name, subdomain, address, level, board, schoolCode, phoneNumbers, email, principalName, establishedYear, language, metaData } = validation.data;
    const userData = getUser(req);
    const userId = userData?.id;
    const roleId = userData?.roleId;
    const { context } = getSchoolContext(req);

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Provided context must be platform' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'User authentication required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!roleId) {
      res.status(500).json({
        success: false,
        error: { message: 'User role not found. Please contact support.' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    

    if (!hasPermission(PERMISSIONS.SCHOOL.CREATE, userData)) {
      res.status(403).json({
        success: false,
        error: { message: 'User does not have permission to create school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if school name already exists
    const existingSchoolname = await prisma.school.findUnique({
      where: { name }
    });

    if (existingSchoolname) {
      res.status(409).json({
        success: false,
        error: { message: 'School with this name already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if school with given subdomain already exists
    const existingSubdomain = await prisma.school.findUnique({
      where: { subdomain }
    });

    if (existingSubdomain) {
      res.status(409).json({
        success: false,
        error: { message: 'Subdomain already taken' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // check if school code already exists
    const existingSchoolCode = await prisma.school.findUnique({
      where: { schoolCode }
    });

    if (existingSchoolCode) {
      res.status(409).json({
        success: false,
        error: { message: 'School code already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create school record
    const school = await prisma.school.create({
      data: {
        name,
        subdomain,
        address: address as any,
        level,
        board,
        schoolCode,
        phoneNumbers,
        email,
        principalName,
        establishedYear,
        language,
        metaData: metaData as any,
      }
    });

    // Update user's schoolId in auth service
    try {

      console.log(config.authServiceUrl);

      const authServiceResponse = await axios.post(
        `${config.authServiceUrl}/api/v1/auth/update-admin-with-schoolId`,
        { schoolId: school.id, userId: userId },
        {
          timeout: config.authServiceTimeout
        }
      );

      if (!authServiceResponse.data.success) {
        // Rollback: Delete the created school
        await prisma.school.delete({
          where: { id: school.id }
        });
        
        res.status(500).json({
          success: false,
          error: { message: 'Failed to update user school association. School creation rolled back.' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    } catch (authServiceError: any) {
      console.error('Auth service error:', authServiceError);
      
      // Rollback: Delete the created school
      try {
        await prisma.school.delete({
          where: { id: school.id }
        });
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
        // Log the error but still return the auth service error to user
      }
      
      res.status(500).json({
        success: false,
        error: { 
          message: 'Failed to update user school association. School creation rolled back.',
          details: authServiceError.response?.data?.error?.message || authServiceError.message
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // TODO: Send notification to admin about school creation

    res.status(201).json({
      success: true,
      message: "School created successfully.",
      data: {
        school: {
          id: school.id,
          name: school.name,
          subdomain: school.subdomain,
          address: school.address,
          level: school.level,
          board: school.board,
          schoolCode: school.schoolCode,
          phoneNumbers: school.phoneNumbers,
          email: school.email,
          principalName: school.principalName,
          establishedYear: school.establishedYear,
          full_url: `https://${school.subdomain}.vidyalayaone.com`,
        },
        createdBy: {
          id: userId,
        },
      },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create school' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
