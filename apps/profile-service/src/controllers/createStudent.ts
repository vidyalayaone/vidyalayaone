import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { createStudentSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export async function createStudent(req: Request, res: Response) {
  try {
    // Validate input
    const validation = validateInput(createStudentSchema, req.body, res);
    if (!validation.success) return;
    
    const {
      userId,
      admissionNumber,
      firstName,
      lastName,
      bloodGroup,
      category,
      religion,
      admissionDate,
      dateOfBirth,
      gender,
      address,
      contactInfo,
      profilePhoto,
      guardians,
      classId,
      sectionId,
      academicYear,
      rollNumber,
    } = validation.data;

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

    if (user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { message: 'Only admins can create students' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if user already has a student profile
    const existingStudent = await prisma.student.findUnique({
      where: { userId }
    });

    if (existingStudent) {
      res.status(400).json({
        success: false,
        error: { message: 'User already has a student profile' },
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

    // Create student with guardians and enrollment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create student
      const student = await tx.student.create({
        data: {
          userId,
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
          contactInfo,
          profilePhoto,
        },
      });

      // Create guardians and link them to the student
      const guardianPromises = guardians.map(async (guardianData) => {
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
      },
    });

    res.status(201).json({
      success: true,
      data: {
        student: createdStudent,
        message: 'Student created successfully',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error creating student:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      res.status(400).json({
        success: false,
        error: { message: 'Student with this admission number already exists for this school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while creating student' },
      timestamp: new Date().toISOString()
    });
  }
}
