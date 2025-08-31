import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { updateTeacherSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    // Get teacher ID from URL params
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

    // Validate input
    const validation = validateInput(updateTeacherSchema, req.body, res);
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
    } = validation.data;

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    // Only allow updates in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Teacher updates are only allowed in school context' },
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
    if (!hasPermission(PERMISSIONS.TEACHER.UPDATE, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'User does not have permission to update teachers' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if teacher exists and belongs to this school
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        documents: true,
      },
    });

    if (!existingTeacher) {
      res.status(404).json({
        success: false,
        error: { message: 'Teacher not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify that the teacher belongs to the same school as the context
    if (existingTeacher.schoolId !== schoolId) {
      res.status(403).json({
        success: false,
        error: { message: 'Access denied. Teacher does not belong to your school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if employee ID is being changed and already exists for another teacher in this school
    if (employeeId && employeeId !== existingTeacher.employeeId) {
      const teacherWithSameEmployeeId = await prisma.teacher.findFirst({
        where: {
          employeeId,
          schoolId,
          id: { not: id }, // Exclude current teacher
        }
      });

      if (teacherWithSameEmployeeId) {
        res.status(400).json({
          success: false,
          error: { message: 'A teacher with this employee ID already exists in the school' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Start a transaction to update teacher and related data
    const updatedTeacher = await prisma.$transaction(async (tx) => {
      // Verify that all subject IDs exist and belong to the same school if provided
      if (subjectIds !== undefined && subjectIds.length > 0) {
        // Note: We can't validate subjects here since Subject model is in school-service
        // The validation should be done at the API gateway or school-service level
        // For now, we'll just update the subjectIds array as-is
      }

      // Update teacher info including subjectIds
      const teacher = await tx.teacher.update({
        where: { id },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          employeeId: employeeId || undefined,
          gender: gender || undefined,
          bloodGroup: bloodGroup || undefined,
          maritalStatus: maritalStatus || undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          category: category || undefined,
          religion: religion || undefined,
          qualifications: qualifications || undefined,
          experienceYears: experienceYears || undefined,
          joiningDate: joiningDate ? new Date(joiningDate) : undefined,
          salary: salary || undefined,
          // Update address as JSON field
          ...(address && { address }),
          // Update subjectIds array if provided
          ...(subjectIds !== undefined && { subjectIds }),
        },
        include: {
          documents: {
            select: {
              id: true,
              name: true,
              description: true,
              type: true,
              url: true,
              mimeType: true,
              fileSize: true,
              createdAt: true,
            },
          },
        },
      });

      return teacher;
    });

    if (!updatedTeacher) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update teacher' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Construct response
    const teacherResponse = {
      id: updatedTeacher.id,
      userId: updatedTeacher.userId,
      employeeId: updatedTeacher.employeeId,
      schoolId: updatedTeacher.schoolId,
      firstName: updatedTeacher.firstName,
      lastName: updatedTeacher.lastName,
      fullName: `${updatedTeacher.firstName} ${updatedTeacher.lastName}`,
      gender: updatedTeacher.gender,
      bloodGroup: updatedTeacher.bloodGroup,
      maritalStatus: updatedTeacher.maritalStatus,
      dateOfBirth: updatedTeacher.dateOfBirth?.toISOString(),
      category: updatedTeacher.category,
      religion: updatedTeacher.religion,
      qualifications: updatedTeacher.qualifications,
      experienceYears: updatedTeacher.experienceYears,
      joiningDate: updatedTeacher.joiningDate?.toISOString(),
      salary: updatedTeacher.salary,
      address: updatedTeacher.address,
      subjectIds: updatedTeacher.subjectIds,
      subjects: [], // Will be populated by the frontend when it fetches subject details
      documents: updatedTeacher.documents,
      createdAt: updatedTeacher.createdAt.toISOString(),
      updatedAt: updatedTeacher.updatedAt.toISOString(),
    };

    res.status(200).json({
      success: true,
      data: {
        teacher: teacherResponse,
      },
      message: 'Teacher updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
      timestamp: new Date().toISOString()
    });
  }
};
