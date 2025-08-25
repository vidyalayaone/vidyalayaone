import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import axios from 'axios';
import config from '../config/config';

const { prisma } = DatabaseService;

export async function getStudent(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Validate student ID parameter
    if (!id) {
      res.status(400).json({
        success: false,
        error: { message: 'Student ID is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    // Only allow access in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Student access is only allowed in school context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID is required from context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check permissions
    if (!hasPermission(PERMISSIONS.STUDENT.VIEW, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to view student records' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Find the student
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        guardians: {
          include: {
            guardian: true,
          },
        },
        enrollments: {
          where: { isCurrent: true },
        },
        documents: true,
      },
    });

    if (!student) {
      res.status(404).json({
        success: false,
        error: { message: 'Student not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify that the student belongs to the same school as the context
    if (student.schoolId !== schoolId) {
      res.status(403).json({
        success: false,
        error: { message: 'Access denied. Student does not belong to your school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Fetch class and section names for current enrollments
    const enrichedEnrollments = await Promise.all(
      student.enrollments.map(async (enrollment) => {
        try {
          const schoolServiceResponse = await axios.get(
            `${config.services.school.url}/api/v1/school/internal/class/${enrollment.classId}`,
            {
              timeout: config.services.school.timeout
            }
          );

          if (schoolServiceResponse.data.success) {
            const classData = schoolServiceResponse.data.data.class;
            const section = classData.sections.find((s: any) => s.id === enrollment.sectionId);
            
            if (!section) {
              console.warn(`Section ${enrollment.sectionId} not found in class ${enrollment.classId}`);
              return {
                ...enrollment,
                className: classData.name,
                sectionName: 'Unknown Section'
              };
            }

            return {
              ...enrollment,
              className: classData.name,
              sectionName: section.name
            };
          } else {
            console.warn(`Failed to fetch class data for class ID: ${enrollment.classId}`);
            return {
              ...enrollment,
              className: 'Unknown Class',
              sectionName: 'Unknown Section'
            };
          }
        } catch (error) {
          console.error(`Error fetching class data for class ID: ${enrollment.classId}`, error);
          return {
            ...enrollment,
            className: 'Unknown Class',
            sectionName: 'Unknown Section'
          };
        }
      })
    );

    // Create enriched student object with class and section names
    const enrichedStudent = {
      ...student,
      enrollments: enrichedEnrollments
    };

    res.status(200).json({
      success: true,
      data: {
        student: enrichedStudent,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching student:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching student' },
      timestamp: new Date().toISOString()
    });
  }
}
