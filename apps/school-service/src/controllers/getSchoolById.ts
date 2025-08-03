import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getSchoolById(req: Request, res: Response): Promise<void> {
  try {
    const { tenantId } = req.params;

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
        error: { message: 'Only ADMIN can get school data' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: { message: 'Tenant ID parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const school = await prisma.tenant.findUnique({
      where: { 
        id: tenantId,
      },
      select: {
        id: true,
        tenantName: true,
        adminId: true,
        subdomain: true,
        schoolAddress: true,
        schoolType: true,
        estimatedStudentCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!school) {
      res.status(404).json({
        success: false,
        error: { message: 'School not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (school.adminId !== adminId) {
      res.status(403).json({
        success: false,
        error: { message: 'School does not belong to this admin' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        school: {
          id: school.id,
          name: school.tenantName,
          admin_id: school.adminId,
          subdomain: school.subdomain,
          full_url: `https://${school.subdomain}.vidyalayaone.com`,
          address: school.schoolAddress,
          type: school.schoolType,
          estimated_student_count: school.estimatedStudentCount,
          isActive: school.isActive,
        }
      },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Get school by ID error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch school details' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
