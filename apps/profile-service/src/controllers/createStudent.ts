import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { createStudentSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
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

export const createStudent = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = validateInput(createStudentSchema, req.body, res);
    if (!validation.success) return;
    
    const {
      firstName,
      lastName,
      admissionNumber,
      bloodGroup,
      category,
      religion,
      admissionDate,
      dateOfBirth,
      gender,
      address,
      contactInfo,
      parentInfo,
      documents,
      classId,
      sectionId,
      academicYear,
      rollNumber,
    } = validation.data;

    // Generate user credentials
    const username = generateUsername(firstName, lastName, admissionNumber);
    const password = generateTemporaryPassword();
    const { email, primaryPhone } = contactInfo;

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    // Only allow admin users to create students and only in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Student creation is only allowed in school context' },
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

    if(!hasPermission(PERMISSIONS.STUDENT.CREATE, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'User does not have permission to create students' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if admission number already exists for the school
    const existingAdmissionNumber = await prisma.student.findUnique({
      where: {
        admissionNumber_schoolId: {
          admissionNumber,
          schoolId
        }
      }
    });

    if (existingAdmissionNumber) {
      res.status(400).json({
        success: false,
        error: { message: 'Admission number already exists for this school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Process guardian data - convert parentInfo to guardians format if needed
    let processedGuardians: any[] = [];
    
    // Process parent information into guardian format
    if (parentInfo) {
      // Add father as guardian
      if (parentInfo.fatherName) {
        processedGuardians.push({
          firstName: parentInfo.fatherName.split(' ')[0] || parentInfo.fatherName,
          lastName: parentInfo.fatherName.split(' ').slice(1).join(' ') || '',
          phone: parentInfo.fatherPhone,
          email: null,
          relation: 'FATHER',
          address: address, // Use student's address as default
        });
      }
      
      // Add mother as guardian
      if (parentInfo.motherName) {
        processedGuardians.push({
          firstName: parentInfo.motherName.split(' ')[0] || parentInfo.motherName,
          lastName: parentInfo.motherName.split(' ').slice(1).join(' ') || '',
          phone: parentInfo.motherPhone,
          email: null,
          relation: 'MOTHER',
          address: address, // Use student's address as default
        });
      }
      
      // Add guardian if different from parents
      if (parentInfo.guardianName) {
        processedGuardians.push({
          firstName: parentInfo.guardianName.split(' ')[0] || parentInfo.guardianName,
          lastName: parentInfo.guardianName.split(' ').slice(1).join(' ') || '',
          phone: parentInfo.guardianPhone,
          email: null,
          relation: parentInfo.guardianRelation || 'GUARDIAN',
          address: address, // Use student's address as default
        });
      }
    }

    // Ensure we have at least one guardian
    if (processedGuardians.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'At least one guardian is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    let createdUserId: string | null = null;

    try {
      // Step 1: Create user in auth service first
        // Create user in auth service
        const userCreationResult = await authService.createUserForStudent({
          username,
          email,
          phone: primaryPhone,
          password,
          firstName,
          lastName,
          schoolId,
          roleName: 'STUDENT'
        });      if (!userCreationResult.success || !userCreationResult.data?.user?.id) {
        res.status(400).json({
          success: false,
          error: { message: userCreationResult.error?.message || 'Failed to create user account' },
          timestamp: new Date().toISOString()
        });
        return;
      }

      createdUserId = userCreationResult.data.user.id;

      // Step 2: Create student with guardians, enrollment, and documents in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create student
        const student = await tx.student.create({
          data: {
            userId: createdUserId!,
            admissionNumber,
            schoolId,
            firstName,
            lastName,
            bloodGroup,
            category,
            religion,
            admissionDate: new Date(admissionDate),
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender,
            address,
            contactInfo: contactInfo,
            profilePhoto: null, // Set to null for now, can be updated later
            status: 'ACCEPTED', // Set initial status to ACCEPTED
          },
        });

        // Create guardians and link them to the student
        const guardianPromises = processedGuardians.map(async (guardianData) => {
          // Create guardian
          const guardian = await tx.guardian.create({
            data: {
              firstName: guardianData.firstName,
              lastName: guardianData.lastName,
              phone: guardianData.phone,
              email: guardianData.email,
              address: guardianData.address,
            },
          });

          // Link guardian to student
          await tx.studentGuardian.create({
            data: {
              studentId: student.id,
              guardianId: guardian.id,
              relation: guardianData.relation,
            },
          });

          return guardian;
        });

        await Promise.all(guardianPromises);

        // Create enrollment
        const enrollment = await tx.studentEnrollment.create({
          data: {
            studentId: student.id,
            schoolId,
            classId,
            sectionId,
            academicYear,
            rollNumber,
            isCurrent: true,
          },
        });

        // Create documents if provided
        if (documents && documents.length > 0) {
          const documentPromises = documents.map(async (doc) => {
            if (!doc) return null;
            
            return await tx.document.create({
              data: {
                name: doc.name,
                description: doc.description,
                type: doc.type as any, // Will be validated by Prisma enum
                url: doc.base64Data ? `data:${doc.mimeType};base64,${doc.base64Data}` : '',
                mimeType: doc.mimeType,
                fileSize: doc.fileSize ? BigInt(doc.fileSize) : null,
                studentId: student.id,
                uploadedBy: user.id,
                isVerified: false,
              },
            });
          });

          await Promise.all(documentPromises);
        }

        return { student, enrollment };
      });

      // Fetch the complete student data with relations
      const createdStudent = await prisma.student.findUnique({
        where: { id: result.student.id },
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

        // Send credentials email to student
        try {
          if (email) {
            await sendStudentCredentialsEmail(email, username, password);
          }
        } catch (emailError) {
          console.error('Failed to send student credentials email:', emailError);
          // Do not fail the request if email sending fails
        }

      res.status(201).json({
        success: true,
        data: {
          student: createdStudent,
          message: 'Student created successfully',
        },
        timestamp: new Date().toISOString(),
      });

    } catch (transactionError) {
      console.error('❌ Transaction failed, attempting rollback:', transactionError);
      
      // Rollback: Delete the created user from auth service if it was created
      if (createdUserId) {
        try {
          await authService.deleteUser(createdUserId);
          console.log('✅ Successfully rolled back user creation');
        } catch (rollbackError) {
          console.error('❌ Failed to rollback user creation:', rollbackError);
        }
      }

      // Handle specific Prisma errors
      if (transactionError instanceof Error && 'code' in transactionError && transactionError.code === 'P2002') {
        res.status(400).json({
          success: false,
          error: { message: 'Student with this admission number already exists for this school' },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: { message: 'Internal server error while creating student. All changes have been rolled back.' },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error creating student:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while creating student' },
      timestamp: new Date().toISOString()
    });
  }
}
