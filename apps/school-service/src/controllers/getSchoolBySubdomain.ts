import { Request, Response } from 'express';
import DatabaseService from "../services/database";

const { prisma } = DatabaseService;

export async function getSchoolBySubdomain(req: Request, res: Response): Promise<void> {
  try {
    const { subdomain } = req.params;

    if (!subdomain || typeof subdomain !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Subdomain parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const school = await prisma.school.findUnique({
      where: {
        subdomain: subdomain
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
          testing: "testing"
        }
      },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('School fetching error:', error); // Updated error message
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch school data' }, // Updated error message
      timestamp: new Date().toISOString()
    });
    return;
  }
}
