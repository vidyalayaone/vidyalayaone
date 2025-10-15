import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import axios from 'axios';
import config from '../config/config';

const { prisma } = DatabaseService;

export async function getSectionStudents(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId, classId, sectionId } = req.params;

    if (!schoolId || !classId || !sectionId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID, Class ID, and Section ID are required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userData = getUser(req);
    const { context } = getSchoolContext(req);

    // Check permissions
    if (!await hasPermission(PERMISSIONS.STUDENT.VIEW, userData)) {
      res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You do not have permission to view students' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify section exists
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        classId: classId,
        class: {
          schoolId: schoolId
        }
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            schoolId: true
          }
        }
      }
    });

    if (!section) {
      res.status(404).json({
        success: false,
        error: { message: 'Section not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      // Call profile service to get students for this section
      const profileServiceUrl = config.services.profile.url;
      const studentsResponse = await axios.get(
        `${profileServiceUrl}/api/v1/profile/schools/students`,
        {
          params: {
            schoolId: schoolId,
            classId: classId,
            sectionId: sectionId,
            academicYear: section.class.academicYear
          },
          headers: {
            'Authorization': req.headers.authorization,
            'x-context': 'school',
            'x-school-id': schoolId
          },
          timeout: config.services.profile.timeout
        }
      );

      if (studentsResponse.data.success) {
        res.status(200).json({
          success: true,
          data: {
            students: studentsResponse.data.data.students || [],
            section: {
              id: section.id,
              name: section.name
            },
            class: {
              id: section.class.id,
              name: section.class.name,
              academicYear: section.class.academicYear
            },
            totalStudents: studentsResponse.data.data.students?.length || 0
          },
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('Profile service returned unsuccessful response');
      }

    } catch (profileServiceError: any) {
      console.warn('Failed to fetch students from profile service:', profileServiceError.message);
      
      // Return empty students list with section info when profile service is unavailable
      res.status(200).json({
        success: true,
        data: {
          students: [],
          section: {
            id: section.id,
            name: section.name
          },
          class: {
            id: section.class.id,
            name: section.class.name,
            academicYear: section.class.academicYear
          },
          totalStudents: 0
        },
        message: 'Section found, but student data is currently unavailable',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('Error fetching section students:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching section students' },
      timestamp: new Date().toISOString()
    });
  }
}
