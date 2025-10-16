import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { acceptStudentApplicationSchema } from '../validations/validationSchemas';
import { authService, sendStudentCredentialsEmail } from '../services/authService';

const { prisma } = DatabaseService;

// Helper function to generate username (alphanumeric, lowercase only)
const generateUsername = (firstName: string, lastName: string, admissionNumber: string): string => {
  const baseUsername = `${firstName}${lastName}${admissionNumber}`
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

export const acceptStudentApplication = async (req: Request, res: Response) => {
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
        error: { message: 'Student application access is only allowed in school context' },
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
    if (!hasPermission(PERMISSIONS.ADMISSION.APPROVE, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions to accept student applications' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate request body
    const validation = acceptStudentApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: { 
          message: 'Validation failed',
          details: validation.error.issues
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { admissionNumber, admissionDate, classId, sectionId, rollNumber } = validation.data;

    // Find the student application
    const student = await prisma.student.findFirst({
      where: {
        id,
        schoolId,
        status: 'PENDING'
      },
      include: {
        guardians: {
          include: {
            guardian: true
          }
        }
      }
    });

    if (!student) {
      res.status(404).json({
        success: false,
        error: { message: 'Pending student application not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if admission number already exists
    const existingAdmission = await prisma.student.findFirst({
      where: {
        admissionNumber,
        schoolId,
        id: { not: id }
      }
    });

    if (existingAdmission) {
      res.status(400).json({
        success: false,
        error: { message: 'Admission number already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    let createdUserId: string | null = null;

    try {
      // Step 1: Create user in auth service if not already created
      let userId = null;
      
      if (!userId) {
        // Get primary contact info for user creation
        const contactInfo = student.contactInfo as any || {};
        const primaryPhone = contactInfo.primaryPhone || contactInfo.phone;
        const email = contactInfo.email;

        if (!email || !primaryPhone) {
          res.status(400).json({
            success: false,
            error: { message: 'Email and phone number are required to create user account' },
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Generate user credentials
        const username = generateUsername(student.firstName, student.lastName, admissionNumber);
        const password = generateTemporaryPassword();

        // Create user in auth service
        const userCreationResult = await authService.createUserForStudent({
          username,
          email,
          phone: primaryPhone,
          password,
          firstName: student.firstName,
          lastName: student.lastName,
          schoolId,
          roleName: 'STUDENT'
        });

        if (!userCreationResult.success || !userCreationResult.data?.user?.id) {
          res.status(400).json({
            success: false,
            error: { message: userCreationResult.error?.message || 'Failed to create user account' },
            timestamp: new Date().toISOString()
          });
          return;
        }

        createdUserId = userCreationResult.data.user.id;
        userId = createdUserId;
          // Send credentials email to student after user creation
          try {
            await sendStudentCredentialsEmail(email, username, password);
          } catch (emailError) {
            console.error('Failed to send student credentials email:', emailError);
            // Do not fail the request if email sending fails
          }
      }

      // Step 2: Update student and create enrollment in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update student with accepted status and details
        const updatedStudent = await tx.student.update({
          where: { id },
          data: {
            status: 'ACCEPTED',
            userId,
            admissionNumber,
            admissionDate: new Date(admissionDate)
          },
          include: {
            guardians: {
              include: {
                guardian: true
              }
            },
            enrollments: true,
            documents: true
          }
        });

        // Create enrollment record
        const enrollment = await tx.studentEnrollment.create({
          data: {
            studentId: id,
            schoolId,
            classId,
            sectionId,
            academicYear: '2025-26', // Current academic year
            rollNumber,
            isCurrent: true,
            fromDate: new Date(admissionDate)
          }
        });

        return { student: updatedStudent, enrollment };
      });

      res.status(200).json({
        success: true,
        data: {
          student: result.student,
          enrollment: result.enrollment,
          userCreated: !!createdUserId,
          message: 'Student application accepted successfully'
        },
        timestamp: new Date().toISOString()
      });

    } catch (transactionError: any) {
      console.error('Transaction error:', transactionError);
      
      // If we created a user but failed later, we should ideally clean it up
      // For now, just log the error
      if (createdUserId) {
        console.error(`User ${createdUserId} was created but student acceptance failed. Manual cleanup may be required.`);
      }
      
      res.status(500).json({
        success: false,
        error: { message: transactionError.message || 'Failed to accept student application' },
        timestamp: new Date().toISOString()
      });
      return;
    }

  } catch (error) {
    console.error('Error accepting student application:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while accepting student application' },
      timestamp: new Date().toISOString()
    });
  }
};
