import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import axios from 'axios';
import config from '../config/config';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

interface SubjectDetail {
  id: string;
  name: string;
  code: string;
}

interface SubjectDetailMap {
  [key: string]: SubjectDetail;
}

export async function getAllTeachers(req: Request, res: Response) {
  try {
    const { 
      category = 'all',
      gender = 'all',
      maritalStatus = 'all',
      hasSubjects = 'all'
    } = req.query;

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
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
    if (typeof category !== 'string' || typeof gender !== 'string' || 
        typeof maritalStatus !== 'string' || typeof hasSubjects !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameters' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Only allow access in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Teacher access is only allowed in school context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check permissions
    if (!hasPermission(PERMISSIONS.TEACHER.VIEW, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to view teachers' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Build where clause for filtering
    const whereClause: any = {
      schoolId
    };

    // Apply filters
    if (category !== 'all') {
      whereClause.category = category;
    }

    if (gender !== 'all') {
      whereClause.gender = gender.toUpperCase();
    }

    if (maritalStatus !== 'all') {
      whereClause.maritalStatus = maritalStatus.toUpperCase();
    }

    if (hasSubjects === 'yes') {
      whereClause.subjectIds = {
        not: {
          isEmpty: true
        }
      };
    } else if (hasSubjects === 'no') {
      whereClause.OR = [
        { subjectIds: { isEmpty: true } },
        { subjectIds: { equals: [] } }
      ];
    }

    // Fetch teachers from database
    const teachers = await prisma.teacher.findMany({
      where: whereClause,
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ],
      include: {
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            isVerified: true
          }
        }
      }
    });

    // Get all unique subject IDs from all teachers
    const allSubjectIds = Array.from(
      new Set(
        teachers.flatMap(teacher => teacher.subjectIds || [])
      )
    );

    // Fetch subject details from school service if there are subjects
    let subjectDetailsMap: SubjectDetailMap = {};
    if (allSubjectIds.length > 0) {
      try {
        const subjectsResponse = await axios.post(
          `${config.services.school.url}/api/v1/internal/subjects/bulk`,
          {
            subjectIds: allSubjectIds,
            schoolId
          },
          {
            timeout: config.services.school.timeout,
            headers: {
              'X-Internal-Request': 'true'
            }
          }
        );
        
        if (subjectsResponse.data?.success) {
          const subjects = subjectsResponse.data.data.subjects;
          subjectDetailsMap = subjects.reduce((map: SubjectDetailMap, subject: SubjectDetail) => {
            map[subject.id] = subject;
            return map;
          }, {});
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch subject details from school service:', error);
        // Continue without subject details
      }
    }

    // Transform teachers data with subject details
    const teachersWithDetails = teachers.map(teacher => {
      const subjects = (teacher.subjectIds || []).map(subjectId => {
        const subjectDetail = subjectDetailsMap[subjectId];
        return subjectDetail ? {
          id: subjectDetail.id,
          name: subjectDetail.name,
          code: subjectDetail.code
        } : {
          id: subjectId,
          name: 'Unknown Subject',
          code: 'N/A'
        };
      });

      return {
        id: teacher.id,
        userId: teacher.userId,
        employeeId: teacher.employeeId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        fullName: `${teacher.firstName} ${teacher.lastName}`,
        gender: teacher.gender,
        bloodGroup: teacher.bloodGroup,
        maritalStatus: teacher.maritalStatus,
        dateOfBirth: teacher.dateOfBirth,
        category: teacher.category,
        religion: teacher.religion,
        qualifications: teacher.qualifications,
        experienceYears: teacher.experienceYears,
        joiningDate: teacher.joiningDate,
        salary: teacher.salary,
        address: teacher.address,
        subjectIds: teacher.subjectIds,
        subjects,
        documentCount: teacher.documents.length,
        verifiedDocumentCount: teacher.documents.filter(doc => doc.isVerified).length,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt
      };
    });

    // Calculate summary statistics
    const summary = {
      totalTeachers: teachersWithDetails.length,
      genderDistribution: {
        male: teachersWithDetails.filter(t => t.gender === 'MALE').length,
        female: teachersWithDetails.filter(t => t.gender === 'FEMALE').length,
        other: teachersWithDetails.filter(t => t.gender === 'OTHER').length,
        unspecified: teachersWithDetails.filter(t => !t.gender).length
      },
      maritalStatusDistribution: {
        single: teachersWithDetails.filter(t => t.maritalStatus === 'SINGLE').length,
        married: teachersWithDetails.filter(t => t.maritalStatus === 'MARRIED').length,
        divorced: teachersWithDetails.filter(t => t.maritalStatus === 'DIVORCED').length,
        widowed: teachersWithDetails.filter(t => t.maritalStatus === 'WIDOWED').length,
        unspecified: teachersWithDetails.filter(t => !t.maritalStatus).length
      },
      subjectAssignment: {
        withSubjects: teachersWithDetails.filter(t => t.subjects.length > 0).length,
        withoutSubjects: teachersWithDetails.filter(t => t.subjects.length === 0).length
      },
      experienceDistribution: {
        fresher: teachersWithDetails.filter(t => (t.experienceYears || 0) === 0).length,
        experienced: teachersWithDetails.filter(t => (t.experienceYears || 0) > 0 && (t.experienceYears || 0) <= 5).length,
        senior: teachersWithDetails.filter(t => (t.experienceYears || 0) > 5 && (t.experienceYears || 0) <= 10).length,
        expert: teachersWithDetails.filter(t => (t.experienceYears || 0) > 10).length
      }
    };

    res.status(200).json({
      success: true,
      data: {
        teachers: teachersWithDetails,
        summary,
        filters: {
          category,
          gender,
          maritalStatus,
          hasSubjects
        }
      },
      message: 'Teachers retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching teachers:', error);

    // Handle Prisma errors
    if (error.code && error.code.startsWith('P')) {
      res.status(400).json({
        success: false,
        error: { message: 'Database error occurred', details: error.message },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error occurred while fetching teachers' },
      timestamp: new Date().toISOString()
    });
  }
}
