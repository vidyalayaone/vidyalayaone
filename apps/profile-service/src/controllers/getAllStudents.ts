import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import axios from 'axios';
import config from '../config/config';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

interface ClassSection {
  id: string;
  name: string;
  sections: {
    id: string;
    name: string;
  }[];
}

interface ClassSectionMap {
  [key: string]: {
    className: string;
    sectionName?: string;
  };
}

export async function getAllStudents(req: Request, res: Response) {
  try {
    const {
      academicYear = '2025-26',
      category = 'all',
      classId = 'all',
      sectionId = 'all'
    } = req.query;

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);

    console.log(req.host);

    const user = getUser(req);

    // Validate school ID parameter
    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate query parameters
    if (typeof academicYear !== 'string' || typeof category !== 'string' || 
        typeof classId !== 'string' || typeof sectionId !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameters. All filters must be strings' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate section dependency on class
    if (sectionId !== 'all' && classId === 'all') {
      res.status(400).json({
        success: false,
        error: { message: 'Cannot filter by section without specifying a class' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Only allow access in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Student access is only allowed in school context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if(!hasPermission(PERMISSIONS.STUDENT.VIEW, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to view student records' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate section belongs to class if both are specified
    if (classId !== 'all' && sectionId !== 'all') {
      try {
        const schoolServiceResponse = await axios.get(
          `${config.services.school.url}/api/v1/school/internal/classes-sections/${schoolId}`,
          {
            params: { academicYear },
            timeout: config.services.school.timeout
          }
        );

        if (schoolServiceResponse.data.success) {
          const classes = schoolServiceResponse.data.data.classes;
          const targetClass = classes.find((cls: any) => cls.id === classId);
          
          if (!targetClass) {
            res.status(400).json({
              success: false,
              error: { message: 'Specified class not found' },
              timestamp: new Date().toISOString()
            });
            return;
          }

          const targetSection = targetClass.sections.find((section: any) => section.id === sectionId);
          if (!targetSection) {
            res.status(400).json({
              success: false,
              error: { message: 'Specified section does not belong to the specified class' },
              timestamp: new Date().toISOString()
            });
            return;
          }
        }
      } catch (error) {
        console.warn('Could not validate class-section relationship:', error);
        // Continue - validation failed but we'll proceed
      }
    }

    // Build the where clause for students based on filters
    const studentWhereClause: any = {
      schoolId,
      status: 'ACCEPTED', // Only include accepted students
      enrollments: {
        some: {
          isCurrent: true,
          academicYear: academicYear as string,
          // Add class filter if specified
          ...(classId !== 'all' && { classId }),
          // Add section filter if specified
          ...(sectionId !== 'all' && { sectionId })
        }
      }
    };

    // Add category filter if specified
    if (category !== 'all') {
      studentWhereClause.category = category;
    }

    // Fetch all students for the school with current enrollments and filters
    const students = await prisma.student.findMany({
      where: studentWhereClause,
      select: {
        id: true,
        userId: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        profilePhoto: true,
        admissionDate: true,
        enrollments: {
          where: {
            isCurrent: true,
            academicYear: academicYear as string,
            // Apply same filters to enrollment selection
            ...(classId !== 'all' && { classId }),
            ...(sectionId !== 'all' && { sectionId })
          },
          select: {
            classId: true,
            sectionId: true,
            rollNumber: true,
            academicYear: true,
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    if (students.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          students: [],
          totalStudents: 0,
          filters: {
            academicYear,
            category,
            classId,
            sectionId
          },
          schoolId
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Extract unique class and section IDs
    const classIds = new Set<string>();
    const sectionIds = new Set<string>();

    students.forEach(student => {
      student.enrollments.forEach(enrollment => {
        classIds.add(enrollment.classId);
        sectionIds.add(enrollment.sectionId);
      });
    });

    // If filtering by specific class/section, we can optimize the school service call
    let classesAndSections: ClassSection[] = [];
    try {
      // console.log(`🔗 Attempting to connect to school service at: ${config.services.school.url}`);
      // console.log(`📋 Request URL: ${config.services.school.url}/api/v1/school/internal/classes-sections/${schoolId}?academicYear=${academicYear}`);
      
      // Make internal request to school service (no auth required for internal route)
      const schoolServiceResponse = await axios.get(
        `${config.services.school.url}/api/v1/school/internal/classes-sections/${schoolId}`,
        {
          params: { academicYear },
          timeout: config.services.school.timeout
        }
      );

      // console.log('✅ School service response received successfully');
      // console.log(schoolServiceResponse.data);

      if (schoolServiceResponse.data.success) {
        classesAndSections = schoolServiceResponse.data.data.classes;
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch classes and sections from school service:', error);
    }

    // Create a comprehensive mapping of ALL class and section IDs to names for this school
    const classMap: ClassSectionMap = {};
    
    // Build map for ALL classes and sections (not just ones with students)
    classesAndSections.forEach(cls => {
      cls.sections.forEach(section => {
        const key = `${cls.id}-${section.id}`;
        classMap[key] = {
          className: cls.name,
          sectionName: section.name
        };
      });
    });

    // Format the response with class and section names
    const formattedStudents = students.map(student => {
      const currentEnrollment = student.enrollments[0]; // Should only be one current enrollment
      
      let className: string | null = null;
      let sectionName: string | null = null;
      
      if (currentEnrollment) {
        const key = `${currentEnrollment.classId}-${currentEnrollment.sectionId}`;
        const classSection = classMap[key];
        
        if (classSection) {
          // Valid class and section found in school data
          className = classSection.className;
          sectionName = classSection.sectionName || null;
        } else {
          // Invalid class/section ID - not found in school data
          console.warn(`Invalid class/section combination for student ${student.id}: classId=${currentEnrollment.classId}, sectionId=${currentEnrollment.sectionId}`);
          className = null;
          sectionName = null;
        }
      }

      return {
        id: student.id,
        userId: student.userId,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        profilePhoto: student.profilePhoto,
        admissionDate: student.admissionDate,
        isactive: true,
        currentClass: className,
        currentSection: sectionName,
        rollNumber: currentEnrollment?.rollNumber || null,
        academicYear: currentEnrollment?.academicYear || academicYear
      };
    });

    res.status(200).json({
      success: true,
      data: {
        students: formattedStudents,
        totalStudents: formattedStudents.length,
        filters: {
          academicYear,
          category,
          classId,
          sectionId
        },
        appliedFilters: {
          category: category !== 'all' ? category : null,
          className: classId !== 'all' ? (classesAndSections.find(c => c.id === classId)?.name || classId) : null,
          sectionName: sectionId !== 'all' ? (
            classesAndSections
              .find(c => c.id === classId)
              ?.sections.find(s => s.id === sectionId)?.name || sectionId
          ) : null
        },
        schoolId
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching students' },
      timestamp: new Date().toISOString()
    });
  }
}
