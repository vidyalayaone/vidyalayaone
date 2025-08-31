import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { assignClassTeacherSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function assignClassTeacher(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(assignClassTeacherSchema, req.body, res);
    if (!validation.success) return;

    const { sectionId, teacherId } = validation.data;
    const userData = getUser(req);
    const { context } = getSchoolContext(req);

    // Check permissions - only admin can assign class teachers
    if (!await hasPermission(PERMISSIONS.SECTION.UPDATE, userData)) {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions to assign class teacher' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify section exists and get related information
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        class: {
          include: {
            school: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!section) {
      res.status(404).json({
        success: false,
        error: { message: 'Section not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // For platform context, allow any school
    // For school context, verify user belongs to the same school
    if (context === 'school') {
      const schoolContext = getSchoolContext(req);
      if (schoolContext.schoolId !== section.class.school.id) {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied: You can only assign teachers to sections in your school' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Update the section with the new class teacher
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: { 
        classTeacherId: teacherId,
        updatedAt: new Date()
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            school: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        section: {
          id: updatedSection.id,
          name: updatedSection.name,
          classTeacherId: updatedSection.classTeacherId,
          class: {
            id: updatedSection.class.id,
            name: updatedSection.class.name,
            academicYear: updatedSection.class.academicYear
          },
          school: {
            id: updatedSection.class.school.id,
            name: updatedSection.class.school.name
          }
        }
      },
      message: 'Class teacher assigned successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error assigning class teacher:', error);
    
    res.status(500).json({
      success: false,
      error: { 
        message: 'An unexpected error occurred while assigning class teacher',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
}
