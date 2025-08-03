import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext } from '@vidyalayaone/common-utils';
import { SchoolType } from '../generated/client';
import config from "../config/config";
import axios from 'axios';

const { prisma } = DatabaseService;

export async function createSchool(req: Request, res: Response): Promise<void> {
  try {
    const { school_name, school_address, school_type, estimated_student_count, subdomain } = req.body;

    const adminId = req.user?.id;
    const role = req.user?.role;
    const { context } = getSchoolContext(req);

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Provided context must be platform' },
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

    if (!adminId) {
      res.status(401).json({
        success: false,
        error: { message: 'User authentication required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!school_name || typeof school_name !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'School name is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (school_name.length < 2 || school_name.length > 255) {
      res.status(400).json({
        success: false,
        error: { message: 'School name must be between 2-255 characters' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!school_address || typeof school_address !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'School address is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!school_type || typeof school_type !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'School type is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const validSchoolTypes = ['primary', 'secondary', 'higher_secondary', 'mixed'];
    if (!validSchoolTypes.includes(school_type)) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid school type' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!subdomain || typeof subdomain !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Subdomain name is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (subdomain.length < 2 || subdomain.length > 50) {
      res.status(400).json({
        success: false,
        error: { message: 'Subdomain name must be between 2-50 characters' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if school name already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: { tenantName: school_name }
    });

    if (existingTenant) {
      res.status(409).json({
        success: false,
        error: { message: 'School with this name already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if school with given subdomain already exists
    const existingSubdomain = await prisma.tenant.findFirst({
      where: { subdomain: subdomain }
    });

    if (existingSubdomain) {
      res.status(409).json({
        success: false,
        error: { message: 'Subdomain already taken' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const existingAdminId = await prisma.tenant.findFirst({
      where: { adminId: adminId }
    });

    if (existingAdminId) {
      res.status(409).json({
        success: false,
        error: { message: 'Admin already has a tenant' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create tenant record
    const tenant = await prisma.tenant.create({
      data: {
        tenantName: school_name,
        adminId: adminId,
        subdomain,
        schoolAddress: school_address,
        schoolType: school_type as SchoolType,
        estimatedStudentCount: estimated_student_count,
        isActive: true
      }
    });

    try {
      const authServiceUrl: string = config.authServiceUrl;
      const authServiceTimeout: number = config.authServiceTimeout;
      const response = await axios.post(
        `${authServiceUrl}/api/v1/add-tenant-to-admin`,
        {
          adminId,
          tenantId: tenant.id
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
          error: { message: 'Failed to add tenant to admin' },
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

    // TODO: Send welcome email
    // await sendWelcomeEmail(tenant, adminId);

    res.status(201).json({
      success: true,
      message: "School created successfully.",
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.tenantName,
          subdomain: tenant.subdomain,
          full_url: `https://${tenant.subdomain}.vidyalayaone.com`,
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
