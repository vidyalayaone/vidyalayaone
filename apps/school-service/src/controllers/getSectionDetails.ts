import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { profileService } from '../services/profileService';

const { prisma } = DatabaseService;

export async function getSectionDetails(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId, classId, sectionId } = req.params;

    console.log('Fetching details for section:', { schoolId, classId, sectionId });

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
    if (!await hasPermission(PERMISSIONS.CLASS.VIEW, userData)) {
      res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You do not have permission to view section details' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true }
    });

    if (!school) {
      res.status(404).json({
        success: false,
        error: { message: 'School not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get class details
    const classDetails = await prisma.class.findFirst({
      where: {
        id: classId,
        schoolId: schoolId
      },
      select: {
        id: true,
        name: true,
        academicYear: true
      }
    });

    if (!classDetails) {
      res.status(404).json({
        success: false,
        error: { message: 'Class not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get section details with basic info
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        classId: classId
      },
      select: {
        id: true,
        name: true,
        classTeacherId: true,
        metaData: true,
        createdAt: true,
        updatedAt: true
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

    // Note: For now, we'll return basic section info. In a full implementation,
    // you might want to include assigned teacher, subjects count, etc.
    // This would require additional models/relationships in your schema.

    // Fetch class teacher details if classTeacherId exists
    let classTeacher = null;
    if (section.classTeacherId) {
      try {
        const teacherResponse = await profileService.getTeacherDetails(section.classTeacherId);
        if (teacherResponse.success && teacherResponse.data) {
          classTeacher = {
            id: teacherResponse.data.teacher.id,
            name: teacherResponse.data.teacher.fullName,
            firstName: teacherResponse.data.teacher.firstName,
            lastName: teacherResponse.data.teacher.lastName,
            employeeId: teacherResponse.data.teacher.employeeId
          };
        } else {
          console.warn(`Failed to fetch teacher details for ID: ${section.classTeacherId}`, teacherResponse.error?.message);
        }
      } catch (error) {
        console.error(`Error fetching teacher details for ID: ${section.classTeacherId}`, error);
        // Continue without teacher details rather than failing the entire request
      }
    }

    res.status(200).json({
      success: true,
      data: {
        section: {
          id: section.id,
          name: section.name,
          classTeacherId: section.classTeacherId,
          metaData: section.metaData,
          createdAt: section.createdAt,
          updatedAt: section.updatedAt
        },
        class: {
          id: classDetails.id,
          name: classDetails.name,
          academicYear: classDetails.academicYear
        },
        school: {
          id: school.id,
          name: school.name
        },
        // Enhanced section metadata with class teacher details
        stats: {
          totalStudents: 0, // Will be populated when student enrollment is implemented
          totalSubjects: 0, // Will be populated when subject assignment is implemented
          classTeacher: classTeacher // Now populated with actual teacher details
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching section details:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching section details' },
      timestamp: new Date().toISOString()
    });
  }
}
