import { Request, Response } from 'express';
import DatabaseService from "../services/database";

const { prisma } = DatabaseService;

export async function getSchoolBySubdomain(req: Request, res: Response): Promise<void> {
  try {
    const { subdomain } = req.query;

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

    if (!school || !school.isActive) {
      res.status(404).json({
        success: false,
        error: { message: 'No active school found for domain' }, // Fixed error message
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
          isActive: school.isActive,
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
