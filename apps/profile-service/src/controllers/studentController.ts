import { Response } from 'express';
import { AuthenticatedRequest, PaginationResult } from '../types';
import { getTenantContext } from '../utils/tenantContext';
import { getPaginationParams, generateUsername, generateUsernameWithIncrement } from '../utils/helpers';
import { validateInput } from '../validations/validator';
import { createStudentSchema, updateStudentSchema, queryParamsSchema } from '../validations/schemas';
import DatabaseService from '../services/database';
import AuthService from '../services/authService';

const { prisma } = DatabaseService;

export async function createStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validation = validateInput(createStudentSchema, req.body, res);
    if (!validation.success) return;

    const { tenantId } = getTenantContext(req);
    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: { message: 'Tenant context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const studentData = validation.data;
    
    // Check for existing email/phone
    const existingStudent = await prisma.student.findFirst({
      where: {
        tenantId,
        OR: [
          { email: studentData.email },
          { phone: studentData.phone }
        ]
      }
    });

    if (existingStudent) {
      res.status(409).json({
        success: false,
        error: { message: 'Student with this email or phone already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check roll number uniqueness if provided
    if (studentData.rollNumber) {
      const existingRollNumber = await prisma.student.findFirst({
        where: {
          tenantId,
          rollNumber: studentData.rollNumber,
          class: studentData.class
        }
      });

      if (existingRollNumber) {
        res.status(409).json({
          success: false,
          error: { message: 'Roll number already exists in this class' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Generate username
    const nameParts = studentData.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const baseUsername = generateUsername(firstName, lastName);
    
    // Check for existing usernames
    const existingUsernames = await prisma.student.findMany({
      where: { tenantId },
      select: { username: true }
    });
    
    const username = generateUsernameWithIncrement(
      baseUsername, 
      existingUsernames.map((s: any) => s.username)
    );

    // Create user in auth service
    const authResponse = await AuthService.createUser({
      name: studentData.name,
      email: studentData.email,
      username,
      phone: studentData.phone,
      role: 'STUDENT',
      tenantId,
    });

    if (!authResponse.success) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create user account' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create student profile
    const student = await prisma.student.create({
      data: {
        tenantId,
        userId: authResponse.data.userId,
        name: studentData.name,
        username,
        email: studentData.email,
        phone: studentData.phone,
        gender: studentData.gender,
        dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
        address: studentData.address,
        class: studentData.class,
        section: studentData.section,
        rollNumber: studentData.rollNumber,
        admissionDate: studentData.admissionDate ? new Date(studentData.admissionDate) : null,
        profilePicture: studentData.profilePicture,
      }
    });

    res.status(201).json({
      success: true,
      data: {
        student,
        credentials: {
          username,
          temporaryPassword: authResponse.data.temporaryPassword
        }
      },
      message: 'Student created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create student' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function getStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const queryValidation = validateInput(queryParamsSchema, req.query, res);
    if (!queryValidation.success) return;

    const { tenantId } = getTenantContext(req);
    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: { message: 'Tenant context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { page, limit, offset } = getPaginationParams(
      queryValidation.data.page,
      queryValidation.data.limit
    );

    const filters = queryValidation.data;
    const where: any = { tenantId };

    // Apply filters
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { rollNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.class) {
      where.class = parseInt(filters.class);
    }

    if (filters.section) {
      where.section = filters.section;
    }

    // Get total count
    const total = await prisma.student.count({ where });

    // Get students
    const students = await prisma.student.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            uploadedAt: true
          }
        }
      }
    });

    const result: PaginationResult<any> = {
      items: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    };

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch students' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function getStudentById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { tenantId } = getTenantContext(req);

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: { message: 'Tenant context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        documents: true
      }
    });

    if (!student || student.tenantId !== tenantId) {
      res.status(404).json({
        success: false,
        error: { message: 'Student not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: student,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch student' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function updateStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validation = validateInput(updateStudentSchema, req.body, res);
    if (!validation.success) return;

    const { tenantId } = getTenantContext(req);
    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: { message: 'Tenant context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    });

    if (!existingStudent || existingStudent.tenantId !== tenantId) {
      res.status(404).json({
        success: false,
        error: { message: 'Student not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const updateData = validation.data;

    // Check for email/phone conflicts
    if (updateData.email || updateData.phone) {
      const conflictStudent = await prisma.student.findFirst({
        where: {
          tenantId,
          id: { not: id },
          OR: [
            ...(updateData.email ? [{ email: updateData.email }] : []),
            ...(updateData.phone ? [{ phone: updateData.phone }] : [])
          ]
        }
      });

      if (conflictStudent) {
        res.status(409).json({
          success: false,
          error: { message: 'Email or phone already exists' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Check roll number conflicts
    if (updateData.rollNumber && updateData.class) {
      const conflictRollNumber = await prisma.student.findFirst({
        where: {
          tenantId,
          id: { not: id },
          rollNumber: updateData.rollNumber,
          class: updateData.class
        }
      });

      if (conflictRollNumber) {
        res.status(409).json({
          success: false,
          error: { message: 'Roll number already exists in this class' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        admissionDate: updateData.admissionDate ? new Date(updateData.admissionDate) : undefined,
      },
      include: {
        documents: true
      }
    });

    res.status(200).json({
      success: true,
      data: updatedStudent,
      message: 'Student updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update student' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function deleteStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { tenantId } = getTenantContext(req);

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: { message: 'Tenant context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student || student.tenantId !== tenantId) {
      res.status(404).json({
        success: false,
        error: { message: 'Student not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    await prisma.student.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete student' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function resetStudentPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { tenantId } = getTenantContext(req);

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: { message: 'Tenant context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student || student.tenantId !== tenantId) {
      res.status(404).json({
        success: false,
        error: { message: 'Student not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const authResponse = await AuthService.resetUserPassword(student.userId, tenantId);

    if (!authResponse.success) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to reset password' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        temporaryPassword: authResponse.data.temporaryPassword
      },
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Reset student password error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to reset password' },
      timestamp: new Date().toISOString()
    });
  }
}
