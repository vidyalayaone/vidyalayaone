import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function deleteSchool(req: Request, res: Response): Promise<void> {
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
        error: { message: 'Only ADMIN can update school' },
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

    // TODO: Add confirmation check
    // TODO: Clean up related data in other services
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: false }
    });

    res.status(200).json({
      success: true,
      message: "School deleted successfully.",
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete school' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
