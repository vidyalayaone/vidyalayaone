import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import config from "../config/config";
import axios from 'axios';
import { createSchoolSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export async function createSchool(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(createSchoolSchema, req.body, res);
    if (!validation.success) return;

    const { name, subdomain, address, level, board, schoolCode, phoneNumbers, email, principalName, establishedYear, language, metaData } = validation.data;
    const adminData = getUser(req);
    const adminId = adminData?.id;
    const role = adminData?.role;    
    const { context } = getSchoolContext(req);

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Provided context must be platform' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!adminId) {
      res.status(401).json({
        success: false,
        error: { message: 'User authentication required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (role !== 'ADMIN') {
      res.status(400).json({
        success: false,
        error: { message: 'Only ADMIN can create school' },
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

    try {
      const authServiceUrl: string = config.authServiceUrl;
      const authServiceTimeout: number = config.authServiceTimeout;
      const response = await axios.post(
        `${authServiceUrl}/api/v1/update-admin`,
        {
          adminId,
          subdomain: school.subdomain,
        },
        { 
          timeout: authServiceTimeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        res.status(500).json({
          success: false,
          error: { message: 'Failed to add school to admin' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }
    catch (axiosError) {
      console.error('Auth service communication error:', axiosError);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to communicate with auth service' },
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
        }
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
