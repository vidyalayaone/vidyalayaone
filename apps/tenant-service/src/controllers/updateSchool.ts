import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getTenantContext } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function updateSchool(req: Request, res: Response): Promise<void> {
  try {
    const { tenantId } = req.params;
    const { school_name, school_address, school_type, estimated_student_count } = req.body;

    const adminId = req.user?.id;
    const role = req.user?.role;
    const { context } = getTenantContext(req);

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
        error: { message: 'Only ADMIN can update school' },
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

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: { message: 'Tenant ID parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (school_name && typeof school_name !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'School name must be a string' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (school_name && (school_name.length < 2 || school_name.length > 255)) {
      res.status(400).json({
        success: false,
        error: { message: 'School name must be between 2-255 characters' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (school_address && typeof school_address !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'School address must be a string' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const validSchoolTypes = ['primary', 'secondary', 'higher_secondary', 'mixed'];
    if (school_type && !validSchoolTypes.includes(school_type)) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid school type' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (estimated_student_count !== undefined && (typeof estimated_student_count !== 'number' || estimated_student_count < 0)) {
      res.status(400).json({
        success: false,
        error: { message: 'Estimated student count must be a positive number' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const existingSchool = await prisma.tenant.findUnique({
      where: { 
        id: tenantId,
      }
    });

    if (!existingSchool) {
      res.status(404).json({
        success: false,
        error: { message: 'School not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (existingSchool.adminId !== adminId) {
      res.status(403).json({
        success: false,
        error: { message: 'School does not belong to this admin' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const updateData: any = {};
    if (school_name) updateData.tenantName = school_name;
    if (school_address) updateData.schoolAddress = school_address;
    if (school_type) updateData.schoolType = school_type;
    if (estimated_student_count !== undefined) updateData.estimatedStudentCount = estimated_student_count;

    const updatedSchool = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
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

    res.status(200).json({
      success: true,
      message: "School updated successfully.",
      data: {
        school: {
          id: updatedSchool.id,
          name: updatedSchool.tenantName,
          admin_id: updatedSchool.adminId,
          subdomain: updatedSchool.subdomain,
          full_url: `https://${updatedSchool.subdomain}.vidyalayaone.com`,
          address: updatedSchool.schoolAddress,
          type: updatedSchool.schoolType,
          estimated_student_count: updatedSchool.estimatedStudentCount,
          isActive: updatedSchool.isActive,
          updated_at: updatedSchool.updatedAt,
      },
      timestamp: new Date().toISOString()
      }
    });
    return;
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update school' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
