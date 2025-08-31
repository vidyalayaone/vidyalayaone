import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { updateStudentSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import axios from 'axios';
import config from '../config/config';

const { prisma } = DatabaseService;

export const updateStudent = async (req: Request, res: Response) => {
  try {
    // Get student ID from URL params
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

    // Validate input
    const validation = validateInput(updateStudentSchema, req.body, res);
    if (!validation.success) return;
    
    // Use ID from URL params, not from request body
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
      classId,
      sectionId,
      academicYear,
      rollNumber,
    } = validation.data;

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    // Only allow updates in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Student updates are only allowed in school context' },
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
    if(!hasPermission(PERMISSIONS.STUDENT.UPDATE, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'User does not have permission to update students' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if student exists and belongs to this school
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        guardians: {
          include: {
            guardian: true,
          },
        },
        enrollments: {
          where: { isCurrent: true },
        }
      },
    });

    if (!existingStudent) {
      res.status(404).json({
        success: false,
        error: { message: 'Student not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify that the student belongs to the same school as the context
    if (existingStudent.schoolId !== schoolId) {
      res.status(403).json({
        success: false,
        error: { message: 'Access denied. Student does not belong to your school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Start a transaction to update student and related data
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // 1. Update basic student info and JSON fields
      const student = await tx.student.update({
        where: { id },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          admissionNumber: admissionNumber || undefined,
          bloodGroup: bloodGroup || undefined,
          category: category || undefined,
          religion: religion || undefined,
          admissionDate: admissionDate ? new Date(admissionDate) : undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender: gender || undefined,
          // Update address and contactInfo as JSON fields
          ...(address && { address }),
          ...(contactInfo && { contactInfo }),
        },
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

      // 5. Update parent/guardian info if provided
      // parentInfo in this schema is not an array but an object with father/mother/guardian fields
      if (parentInfo) {
        // Handle father information if provided
        if (parentInfo.fatherName) {
          // Check if father relation already exists
          const existingFather = student.guardians.find(
            sg => sg.relation?.toLowerCase() === 'father'
          );

          if (existingFather) {
            // Update existing guardian
            await tx.guardian.update({
              where: { id: existingFather.guardianId },
              data: {
                firstName: parentInfo.fatherName.split(' ')[0] || undefined,
                lastName: parentInfo.fatherName.split(' ').slice(1).join(' ') || undefined,
                phone: parentInfo.fatherPhone || undefined,
              },
            });
          } else {
            // Create new guardian and relationship
            const newGuardian = await tx.guardian.create({
              data: {
                firstName: parentInfo.fatherName.split(' ')[0],
                lastName: parentInfo.fatherName.split(' ').slice(1).join(' ') || '',
                phone: parentInfo.fatherPhone,
              },
            });

            await tx.studentGuardian.create({
              data: {
                studentId: id,
                guardianId: newGuardian.id,
                relation: 'Father',
              },
            });
          }
        }

        // Handle mother information if provided
        if (parentInfo.motherName) {
          // Check if mother relation already exists
          const existingMother = student.guardians.find(
            sg => sg.relation?.toLowerCase() === 'mother'
          );

          if (existingMother) {
            // Update existing guardian
            await tx.guardian.update({
              where: { id: existingMother.guardianId },
              data: {
                firstName: parentInfo.motherName.split(' ')[0] || undefined,
                lastName: parentInfo.motherName.split(' ').slice(1).join(' ') || undefined,
                phone: parentInfo.motherPhone || undefined,
              },
            });
          } else {
            // Create new guardian and relationship
            const newGuardian = await tx.guardian.create({
              data: {
                firstName: parentInfo.motherName.split(' ')[0],
                lastName: parentInfo.motherName.split(' ').slice(1).join(' ') || '',
                phone: parentInfo.motherPhone,
              },
            });

            await tx.studentGuardian.create({
              data: {
                studentId: id,
                guardianId: newGuardian.id,
                relation: 'Mother',
              },
            });
          }
        }

        // Handle guardian information if provided
        if (parentInfo.guardianName && parentInfo.guardianRelation) {
          // Check if this guardian relation already exists
          const existingGuardian = student.guardians.find(
            sg => sg.relation?.toLowerCase() === parentInfo.guardianRelation?.toLowerCase()
          );

          if (existingGuardian) {
            // Update existing guardian
            await tx.guardian.update({
              where: { id: existingGuardian.guardianId },
              data: {
                firstName: parentInfo.guardianName.split(' ')[0] || undefined,
                lastName: parentInfo.guardianName.split(' ').slice(1).join(' ') || undefined,
                phone: parentInfo.guardianPhone || undefined,
              },
            });
          } else {
            // Create new guardian and relationship
            const newGuardian = await tx.guardian.create({
              data: {
                firstName: parentInfo.guardianName.split(' ')[0],
                lastName: parentInfo.guardianName.split(' ').slice(1).join(' ') || '',
                phone: parentInfo.guardianPhone,
              },
            });

            await tx.studentGuardian.create({
              data: {
                studentId: id,
                guardianId: newGuardian.id,
                relation: parentInfo.guardianRelation,
              },
            });
          }
        }
      }

      // 6. Update enrollment if class or section information is provided
      if (classId && sectionId) {
        // Check if the student already has the current enrollment
        const currentEnrollment = student.enrollments[0];
        
        if (currentEnrollment) {
          // If enrollment exists but class/section is different, update it
          if (currentEnrollment.classId !== classId || 
              currentEnrollment.sectionId !== sectionId ||
              currentEnrollment.rollNumber !== rollNumber) {
                
            await tx.studentEnrollment.update({
              where: { id: currentEnrollment.id },
              data: {
                classId,
                sectionId,
                rollNumber: rollNumber || undefined,
                academicYear: academicYear || currentEnrollment.academicYear,
              }
            });
          }
        } else {
          // Create new enrollment if none exists
          await tx.studentEnrollment.create({
            data: {
              studentId: id,
              schoolId: schoolId,
              classId,
              sectionId,
              rollNumber,
              academicYear: academicYear || '2025-26',
              isCurrent: true,
            }
          });
        }
      }

      return student;
    });

    // Fetch class and section names for current enrollments
    const enrichedEnrollments = await Promise.all(
      updatedStudent.enrollments.map(async (enrollment) => {
        try {
          const schoolServiceResponse = await axios.get(
            `${config.services.school.url}/api/v1/school/internal/class/${enrollment.classId}`,
            {
              timeout: config.services.school.timeout
            }
          );
          
          const sectionResponse = await axios.get(
            `${config.services.school.url}/api/v1/school/internal/section/${enrollment.sectionId}`,
            {
              timeout: config.services.school.timeout
            }
          );

          return {
            ...enrollment,
            className: schoolServiceResponse.data.data.name || 'Unknown Class',
            sectionName: sectionResponse.data.data.name || 'Unknown Section'
          };
        } catch (error) {
          console.error('Error fetching class/section details:', error);
          return {
            ...enrollment,
            className: 'Unknown Class',
            sectionName: 'Unknown Section'
          };
        }
      })
    );

    // Return the updated student with enriched enrollments
    res.status(200).json({
      success: true,
      data: {
        student: {
          ...updatedStudent,
          enrollments: enrichedEnrollments
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update student' },
      timestamp: new Date().toISOString()
    });
  }
};
