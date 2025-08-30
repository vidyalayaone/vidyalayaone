import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { deleteStudentsSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { authService } from '../services/authService';

const { prisma } = DatabaseService;

interface DeleteResult {
  deletedStudents: string[];
  failedDeletions: Array<{
    studentId: string;
    error: string;
  }>;
  deletedUsers: string[];
  failedUserDeletions: Array<{
    userId: string;
    error: string;
  }>;
}

export const deleteStudents = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = validateInput(deleteStudentsSchema, req.body, res);
    if (!validation.success) return;
    
    const { studentIds } = validation.data;

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    // Only allow admin users to delete students and only in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Student deletion is only allowed in school context' },
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

    if (!hasPermission(PERMISSIONS.STUDENT.DELETE, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'User does not have permission to delete students' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Fetch students to verify they exist and belong to the school
    const studentsToDelete = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId: schoolId
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        guardians: {
          select: {
            guardianId: true,
            guardian: {
              select: {
                id: true,
                studentGuardians: {
                  select: {
                    studentId: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Check if all requested students exist in the school
    const foundStudentIds = studentsToDelete.map((s: any) => s.id);
    const notFoundStudentIds = studentIds.filter((id: string) => !foundStudentIds.includes(id));

    if (notFoundStudentIds.length > 0) {
      res.status(404).json({
        success: false,
        error: { 
          message: `Students not found or don't belong to this school: ${notFoundStudentIds.join(', ')}` 
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const deleteResult: DeleteResult = {
      deletedStudents: [],
      failedDeletions: [],
      deletedUsers: [],
      failedUserDeletions: []
    };

    // Process each student deletion
    for (const student of studentsToDelete) {
      try {
        console.log(`🗑️ Starting deletion process for student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`);

        // Get guardians that will become orphaned (guardians with no other students)
        const guardiansToDelete: string[] = [];
        for (const guardianRelation of student.guardians) {
          const otherStudentsCount = guardianRelation.guardian.studentGuardians.filter(
            (sg: any) => sg.studentId !== student.id
          ).length;
          
          if (otherStudentsCount === 0) {
            guardiansToDelete.push(guardianRelation.guardianId);
          }
        }

        // Delete student and related data in a transaction
        await prisma.$transaction(async (tx: any) => {
          // 1. Delete documents (will cascade automatically due to onDelete: Cascade)
          console.log(`📄 Deleting documents for student ${student.id}`);
          
          // 2. Delete student enrollments
          console.log(`🎓 Deleting enrollments for student ${student.id}`);
          await tx.studentEnrollment.deleteMany({
            where: { studentId: student.id }
          });

          // 3. Delete student-guardian relationships
          console.log(`👨‍👩‍👧‍👦 Deleting guardian relationships for student ${student.id}`);
          await tx.studentGuardian.deleteMany({
            where: { studentId: student.id }
          });

          // 4. Delete orphaned guardians
          if (guardiansToDelete.length > 0) {
            console.log(`🗑️ Deleting orphaned guardians: ${guardiansToDelete.join(', ')}`);
            await tx.guardian.deleteMany({
              where: { id: { in: guardiansToDelete } }
            });
          }

          // 5. Delete the student (documents will cascade automatically)
          console.log(`👨‍🎓 Deleting student ${student.id}`);
          await tx.student.delete({
            where: { id: student.id }
          });
        });

        // 6. Delete user from auth service (outside transaction)
        console.log(`🔐 Deleting user ${student.userId} from auth service`);
        try {
          const userDeleteResult = await authService.deleteUser(student.userId);
          if (userDeleteResult.success) {
            deleteResult.deletedUsers.push(student.userId);
            console.log(`✅ Successfully deleted user ${student.userId} from auth service`);
          } else {
            deleteResult.failedUserDeletions.push({
              userId: student.userId,
              error: 'Failed to delete user from auth service'
            });
            console.error(`❌ Failed to delete user ${student.userId} from auth service`);
          }
        } catch (userDeleteError) {
          deleteResult.failedUserDeletions.push({
            userId: student.userId,
            error: 'Error occurred while deleting user from auth service'
          });
          console.error(`❌ Error deleting user ${student.userId} from auth service:`, userDeleteError);
        }

        deleteResult.deletedStudents.push(student.id);
        console.log(`✅ Successfully deleted student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`);

      } catch (studentDeleteError) {
        console.error(`❌ Failed to delete student ${student.id}:`, studentDeleteError);
        deleteResult.failedDeletions.push({
          studentId: student.id,
          error: studentDeleteError instanceof Error ? studentDeleteError.message : 'Unknown error occurred'
        });
      }
    }

    // Prepare response
    const hasFailures = deleteResult.failedDeletions.length > 0 || deleteResult.failedUserDeletions.length > 0;
    const statusCode = hasFailures ? (deleteResult.deletedStudents.length > 0 ? 207 : 500) : 200;

    res.status(statusCode).json({
      success: deleteResult.deletedStudents.length > 0,
      data: {
        summary: {
          totalRequested: studentIds.length,
          successfulDeletions: deleteResult.deletedStudents.length,
          failedDeletions: deleteResult.failedDeletions.length,
          deletedUsers: deleteResult.deletedUsers.length,
          failedUserDeletions: deleteResult.failedUserDeletions.length
        },
        results: deleteResult,
        message: hasFailures 
          ? 'Some students were deleted successfully, but there were failures'
          : 'All students deleted successfully'
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error in deleteStudents controller:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while deleting students' },
      timestamp: new Date().toISOString()
    });
  }
};
