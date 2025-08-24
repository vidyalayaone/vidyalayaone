import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function approveSchool(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params;

    
    const userData = getUser(req);
    console.log(userData);
    const userId = userData?.id;
    const { context } = getSchoolContext(req);

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'School can only be approved in platform context' },
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

    if(!await hasPermission(PERMISSIONS.SCHOOL.APPROVE, userData)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to approve schools' },
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
