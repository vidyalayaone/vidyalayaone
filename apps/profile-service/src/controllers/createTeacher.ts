import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { createTeacherSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { authService } from '../services/authService';
import { sendTeacherCredentialsEmail } from '../services/teacherCredentialsEmail';

const { prisma } = DatabaseService;

import crypto from 'crypto';

// Helper function to generate username (alphanumeric, lowercase only)
const generateUsername = (firstName: string, lastName: string, employeeId: string): string => {
  const baseUsername = `${firstName}${lastName}${employeeId}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
    .substring(0, 15); // Limit to 15 characters
  
  // Add a random suffix to ensure uniqueness
  const randomSuffix = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `${baseUsername}${randomSuffix}`;
};

// Helper function to generate temporary password
const generateTemporaryPassword = (): string => {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

export const createTeacher = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = validateInput(createTeacherSchema, req.body, res);
    if (!validation.success) return;
    
    const {
      firstName,
      lastName,
      employeeId,
      gender,
      bloodGroup,
      maritalStatus,
      dateOfBirth,
      category,
      religion,
      qualifications,
      experienceYears,
      joiningDate,
      salary,
      address,
      subjectIds,
      phoneNumber,
      email,
      documents,
    } = validation.data;

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    // Only allow creation in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Teacher creation is only allowed in school context' },
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
    if (!hasPermission(PERMISSIONS.TEACHER.CREATE, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to create teachers' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if employee ID already exists for this school
    const existingTeacher = await prisma.teacher.findFirst({
      where: {
        employeeId,
        schoolId
      }
    });

    if (existingTeacher) {
      res.status(409).json({
        success: false,
        error: { message: 'Teacher with this employee ID already exists in this school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate username and temporary password
    const username = generateUsername(firstName, lastName, employeeId);
    const temporaryPassword = generateTemporaryPassword();

    // Create user in auth service
    const authResponse = await authService.createUserForTeacher({
      username,
      email, // Required field from validation
      phone: phoneNumber, // Required field from validation
      password: temporaryPassword,
      firstName,
      lastName,
      schoolId,
      roleName: 'TEACHER'
    });

    if (!authResponse.success || !authResponse.data) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create user account', details: authResponse.error },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userId = authResponse.data.user.id;

    // Create teacher profile
    const teacher = await prisma.teacher.create({
      data: {
        userId,
        employeeId,
        schoolId,
        firstName,
        lastName,
        gender,
        bloodGroup,
        maritalStatus,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        category,
        religion,
        qualifications,
        experienceYears,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        salary,
        address,
        subjectIds: subjectIds || [],
        metaData: {
          phoneNumber,
          email,
        }
      }
    });

    // Send credentials email to teacher
    try {
      if (email) {
        await sendTeacherCredentialsEmail(email, username, temporaryPassword);
      }
    } catch (emailError) {
      console.error('Failed to send teacher credentials email:', emailError);
      // Do not fail the request if email sending fails
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
        metaData: teacher.metaData,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt
      },
    };

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'Teacher created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error creating teacher:', error);

    // Handle Prisma known errors
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { message: 'Teacher with this employee ID already exists in this school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Handle other Prisma errors
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
      error: { message: 'Internal server error occurred while creating teacher' },
      timestamp: new Date().toISOString()
    });
  }
};