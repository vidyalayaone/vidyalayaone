import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import axios from 'axios';
import config from '../config/config';

const { prisma } = DatabaseService;

export async function getTeacher(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Validate teacher ID parameter
    if (!id) {
      res.status(400).json({
        success: false,
        error: { message: 'Teacher ID is required' },
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
        error: { message: 'Teacher access is only allowed in school context' },
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
    if (!hasPermission(PERMISSIONS.TEACHER.VIEW, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to view teacher details' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Fetch teacher from database
    const teacher = await prisma.teacher.findFirst({
      where: {
        id,
        schoolId // Ensure teacher belongs to the current school
      },
      include: {
        documents: true
      }
    });

    if (!teacher) {
      res.status(404).json({
        success: false,
        error: { message: 'Teacher not found or does not belong to this school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get user details from auth service if needed
    let userDetails = null;
    try {
      const userResponse = await axios.get(
        `${config.services.auth.url}/api/v1/internal/users/${teacher.userId}`,
        {
          timeout: config.services.auth.timeout,
          headers: {
            'X-Internal-Request': 'true'
          }
        }
      );
      
      if (userResponse.data?.success) {
        userDetails = userResponse.data.data.user;
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch user details from auth service:', error);
      // Continue without user details
    }

    // Get subject details if teacher has subjects assigned
    let subjectDetails = [];
    if (teacher.subjectIds && teacher.subjectIds.length > 0) {
      try {
        const subjectsResponse = await axios.post(
          `${config.services.school.url}/api/v1/internal/subjects/bulk`,
          {
            subjectIds: teacher.subjectIds,
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
          subjectDetails = subjectsResponse.data.data.subjects;
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch subject details from school service:', error);
        // Continue without subject details
      }
    }

    // Prepare response data
    const responseData = {
      teacher: {
        id: teacher.id,
        userId: teacher.userId,
        employeeId: teacher.employeeId,
        schoolId: teacher.schoolId,
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
        subjects: subjectDetails,
        documents: teacher.documents,
        metaData: teacher.metaData,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt
      },
      userDetails: userDetails ? {
        username: userDetails.username,
        email: userDetails.email,
        phone: userDetails.phone,
        isActive: userDetails.isActive,
        lastLogin: userDetails.lastLogin
      } : null
    };

    res.status(200).json({
      success: true,
      data: responseData,
      message: 'Teacher details retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching teacher:', error);

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
      error: { message: 'Internal server error occurred while fetching teacher' },
      timestamp: new Date().toISOString()
    });
  }
}
