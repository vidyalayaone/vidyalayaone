import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getStudentApplications(req: Request, res: Response) {
  try {
    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    // Validate school ID parameter
    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Only allow access in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Student applications access is only allowed in school context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check permissions - assuming we need VIEW permission to see applications
    if (!hasPermission(PERMISSIONS.STUDENT.VIEW, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to view student applications' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Fetch all students for the school grouped by status
    const [acceptedStudents, rejectedStudents, pendingStudents] = await Promise.all([
      // Accepted students
      prisma.student.findMany({
        where: {
          schoolId,
          status: 'ACCEPTED'
        },
        select: {
          id: true,
          userId: true,
          admissionNumber: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          admissionDate: true,
          dateOfBirth: true,
          gender: true,
          category: true,
          contactInfo: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          guardians: {
            include: {
              guardian: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true
                }
              }
            }
          },
          enrollments: {
            where: { isCurrent: true },
            select: {
              classId: true,
              sectionId: true,
              rollNumber: true,
              academicYear: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' },
          { firstName: 'asc' },
          { lastName: 'asc' }
        ]
      }),

      // Rejected students
      prisma.student.findMany({
        where: {
          schoolId,
          status: 'REJECTED'
        },
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          dateOfBirth: true,
          gender: true,
          category: true,
          contactInfo: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          guardians: {
            include: {
              guardian: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: [
          { updatedAt: 'desc' },
          { firstName: 'asc' },
          { lastName: 'asc' }
        ]
      }),

      // Pending students
      prisma.student.findMany({
        where: {
          schoolId,
          status: 'PENDING'
        },
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          dateOfBirth: true,
          gender: true,
          category: true,
          contactInfo: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          guardians: {
            include: {
              guardian: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' },
          { firstName: 'asc' },
          { lastName: 'asc' }
        ]
      })
    ]);

    // Format the response data
    const formatStudentData = (students: any[]) => {
      return students.map(student => ({
        id: student.id,
        userId: student.userId,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        profilePhoto: student.profilePhoto,
        admissionDate: student.admissionDate,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        category: student.category,
        contactInfo: student.contactInfo,
        status: student.status,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        guardians: student.guardians?.map((sg: any) => ({
          relation: sg.relation,
          guardian: sg.guardian
        })) || [],
        currentEnrollment: student.enrollments?.[0] || null
      }));
    };

    const formattedAcceptedStudents = formatStudentData(acceptedStudents);
    const formattedRejectedStudents = formatStudentData(rejectedStudents);
    const formattedPendingStudents = formatStudentData(pendingStudents);

    res.status(200).json({
      success: true,
      data: {
        acceptedStudents: formattedAcceptedStudents,
        rejectedStudents: formattedRejectedStudents,
        pendingStudents: formattedPendingStudents,
        summary: {
          totalAccepted: formattedAcceptedStudents.length,
          totalRejected: formattedRejectedStudents.length,
          totalPending: formattedPendingStudents.length,
          totalApplications: formattedAcceptedStudents.length + formattedRejectedStudents.length + formattedPendingStudents.length
        },
        schoolId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching student applications:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching student applications' },
      timestamp: new Date().toISOString()
    });
  }
}
