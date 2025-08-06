import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getSchoolById(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params;

    const adminData = getUser(req);
    const adminId = adminData?.id;
    const role = adminData?.role;

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID parameter is required' },
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

    // Use the new school table instead of tenant
    const school = await prisma.school.findUnique({
      where: { 
        id: schoolId,
      },
    });

    if (!school) {
      res.status(404).json({
        success: false,
        error: { message: 'School not found' },
        timestamp: new Date().toISOString()
      });
      return;
    } 

    if (!school.isActive) {
      res.status(404).json({
        success: false,
        error: { message: 'School is not active' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
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
          language: school.language,
          metaData: school.metaData,
          full_url: `https://${school.subdomain}.vidyalayaone.com`,
          isActive: school.isActive,
          created_at: school.createdAt,
          updated_at: school.updatedAt,
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
