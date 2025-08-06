import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function activateSchool(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params;

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
        error: { message: 'Only ADMIN can activate school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Find the existing school
    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!existingSchool) {
      res.status(404).json({
        success: false,
        error: { message: 'School not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        isActive: true,
      }
    });

    res.status(200).json({
      success: true,
      message: "School activated successfully.",
      data: {
        school: {
          id: updatedSchool.id,
          name: updatedSchool.name,
          subdomain: updatedSchool.subdomain,
          address: updatedSchool.address,
          level: updatedSchool.level,
          board: updatedSchool.board,
          schoolCode: updatedSchool.schoolCode,
          phoneNumbers: updatedSchool.phoneNumbers,
          email: updatedSchool.email,
          principalName: updatedSchool.principalName,
          establishedYear: updatedSchool.establishedYear,
          language: updatedSchool.language,
          metaData: updatedSchool.metaData,
          full_url: `https://${updatedSchool.subdomain}.vidyalayaone.com`,
          isActive: updatedSchool.isActive,
          updated_at: updatedSchool.updatedAt,
        }
      },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('School activation  error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to activate school' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
