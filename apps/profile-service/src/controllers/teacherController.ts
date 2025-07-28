import { Response } from 'express';
import { AuthenticatedRequest, PaginationResult } from '../types';
import { getTenantContext } from '../utils/tenantContext';
import { getPaginationParams, generateUsername, generateUsernameWithIncrement } from '../utils/helpers';
import { validateInput } from '../validations/validator';
import { createTeacherSchema, updateTeacherSchema, queryParamsSchema } from '../validations/schemas';
import DatabaseService from '../services/database';
import AuthService from '../services/authService';

const { prisma } = DatabaseService;

export async function createTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validation = validateInput(createTeacherSchema, req.body, res);
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

    const teacherData = validation.data;
    
    // Check for existing email/phone
    const existingTeacher = await prisma.teacher.findFirst({
      where: {
        tenantId,
        OR: [
          { email: teacherData.email },
          { phone: teacherData.phone }
        ]
      }
    });

    if (existingTeacher) {
      res.status(409).json({
        success: false,
        error: { message: 'Teacher with this email or phone already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate username
    const nameParts = teacherData.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const baseUsername = generateUsername(firstName, lastName);
    
    // Check for existing usernames
    const existingUsernames = await prisma.teacher.findMany({
      where: { tenantId },
      select: { username: true }
    });
    
    const username = generateUsernameWithIncrement(
      baseUsername, 
      existingUsernames.map(t => t.username)
    );

    // Create user in auth service
    const authResponse = await AuthService.createUser({
      name: teacherData.name,
      email: teacherData.email,
      username,
      phone: teacherData.phone,
      role: 'TEACHER',
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

    // Create teacher profile
    const teacher = await prisma.teacher.create({
      data: {
        tenantId,
        userId: authResponse.data.userId,
        name: teacherData.name,
        username,
        email: teacherData.email,
        phone: teacherData.phone,
        gender: teacherData.gender,
        dateOfBirth: teacherData.dateOfBirth ? new Date(teacherData.dateOfBirth) : null,
        address: teacherData.address,
        subjects: teacherData.subjects,
        classes: teacherData.classes,
        joiningDate: teacherData.joiningDate ? new Date(teacherData.joiningDate) : null,
        employmentType: teacherData.employmentType,
        profilePicture: teacherData.profilePicture,
      }
    });

    res.status(201).json({
      success: true,
      data: {
        teacher,
        credentials: {
          username,
          temporaryPassword: authResponse.data.temporaryPassword
        }
      },
      message: 'Teacher created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Create teacher error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create teacher' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function getTeachers(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.employmentType) {
      where.employmentType = filters.employmentType;
    }

    if (filters.subject) {
      where.subjects = {
        array_contains: [filters.subject]
      };
    }

    if (filters.class) {
      where.classes = {
        array_contains: [parseInt(filters.class)]
      };
    }

    // Get total count
    const total = await prisma.teacher.count({ where });

    // Get teachers
    const teachers = await prisma.teacher.findMany({
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
      items: teachers,
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
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch teachers' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function getTeacherById(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        documents: true
      }
    });

    if (!teacher || teacher.tenantId !== tenantId) {
      res.status(404).json({
        success: false,
        error: { message: 'Teacher not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: teacher,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch teacher' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function updateTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validation = validateInput(updateTeacherSchema, req.body, res);
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

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id }
    });

    if (!existingTeacher || existingTeacher.tenantId !== tenantId) {
      res.status(404).json({
        success: false,
        error: { message: 'Teacher not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const updateData = validation.data;

    // Check for email/phone conflicts
    if (updateData.email || updateData.phone) {
      const conflictTeacher = await prisma.teacher.findFirst({
        where: {
          tenantId,
          id: { not: id },
          OR: [
            ...(updateData.email ? [{ email: updateData.email }] : []),
            ...(updateData.phone ? [{ phone: updateData.phone }] : [])
          ]
        }
      });

      if (conflictTeacher) {
        res.status(409).json({
          success: false,
          error: { message: 'Email or phone already exists' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Update teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        joiningDate: updateData.joiningDate ? new Date(updateData.joiningDate) : undefined,
      },
      include: {
        documents: true
      }
    });

    res.status(200).json({
      success: true,
      data: updatedTeacher,
      message: 'Teacher updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Update teacher error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update teacher' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function deleteTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const teacher = await prisma.teacher.findUnique({
      where: { id }
    });

    if (!teacher || teacher.tenantId !== tenantId) {
      res.status(404).json({
        success: false,
        error: { message: 'Teacher not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    await prisma.teacher.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Delete teacher error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete teacher' },
      timestamp: new Date().toISOString()
    });
  }
}

export async function resetTeacherPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const teacher = await prisma.teacher.findUnique({
      where: { id }
    });

    if (!teacher || teacher.tenantId !== tenantId) {
      res.status(404).json({
        success: false,
        error: { message: 'Teacher not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const authResponse = await AuthService.resetUserPassword(teacher.userId, tenantId);

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
    console.error('Reset teacher password error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to reset password' },
      timestamp: new Date().toISOString()
    });
  }
}
