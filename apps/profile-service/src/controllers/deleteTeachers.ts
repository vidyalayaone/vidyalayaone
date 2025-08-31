import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { deleteTeachersSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { authService } from '../services/authService';

const { prisma } = DatabaseService;

interface DeleteResult {
  deletedTeachers: string[];
  failedDeletions: Array<{
    teacherId: string;
    error: string;
  }>;
  deletedUsers: string[];
  failedUserDeletions: Array<{
    userId: string;
    error: string;
  }>;
}

export const deleteTeachers = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = validateInput(deleteTeachersSchema, req.body, res);
    if (!validation.success) return;
    
    const { teacherIds } = validation.data;

    // Get school context and user information
    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    // Only allow admin users to delete teachers and only in school context
    if (context !== 'school') {
      res.status(400).json({
        success: false,
        error: { message: 'Teacher deletion is only allowed in school context' },
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

    if (!hasPermission(PERMISSIONS.TEACHER.DELETE, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'User does not have permission to delete teachers' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Fetch teachers to verify they exist and belong to the school
    const teachersToDelete = await prisma.teacher.findMany({
      where: {
        id: { in: teacherIds },
        schoolId: schoolId
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        subjectIds: true,
        // Get document count
        _count: {
          select: {
            documents: true
          }
        }
      }
    });

    // Check if all requested teachers exist in the school
    const foundTeacherIds = teachersToDelete.map((t: any) => t.id);
    const notFoundTeacherIds = teacherIds.filter((id: string) => !foundTeacherIds.includes(id));

    if (notFoundTeacherIds.length > 0) {
      res.status(404).json({
        success: false,
        error: { 
          message: `Teachers not found or don't belong to this school: ${notFoundTeacherIds.join(', ')}` 
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const deleteResult: DeleteResult = {
      deletedTeachers: [],
      failedDeletions: [],
      deletedUsers: [],
      failedUserDeletions: []
    };

    // Process each teacher deletion
    for (const teacher of teachersToDelete) {
      try {
        console.log(`🗑️ Starting deletion process for teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.employeeId})`);

        // Check if teacher has subject assignments
        const hasSubjectAssignments = teacher.subjectIds && teacher.subjectIds.length > 0;
        if (hasSubjectAssignments) {
          console.log(`⚠️ Teacher ${teacher.id} has ${teacher.subjectIds.length} subject assignments that will be removed`);
        }

        // Check if teacher has documents
        const hasDocuments = teacher._count.documents > 0;
        if (hasDocuments) {
          console.log(`📄 Teacher ${teacher.id} has ${teacher._count.documents} documents that will be deleted`);
        }

        // Delete teacher and related data in a transaction
        await prisma.$transaction(async (tx: any) => {
          // 1. Delete any teacher documents (will cascade automatically due to onDelete: Cascade)
          console.log(`📄 Deleting documents for teacher ${teacher.id}`);
          // Documents will be automatically deleted due to CASCADE relationship
          
          // 2. Delete the teacher record (this will also cascade delete documents)
          console.log(`👨‍🏫 Deleting teacher ${teacher.id}`);
          await tx.teacher.delete({
            where: { id: teacher.id }
          });
        });

        // 3. Delete user from auth service (outside transaction)
        console.log(`🔐 Deleting user ${teacher.userId} from auth service`);
        try {
          const userDeleteResult = await authService.deleteUser(teacher.userId);
          if (userDeleteResult.success) {
            deleteResult.deletedUsers.push(teacher.userId);
            console.log(`✅ Successfully deleted user ${teacher.userId} from auth service`);
          } else {
            deleteResult.failedUserDeletions.push({
              userId: teacher.userId,
              error: 'Failed to delete user from auth service'
            });
            console.error(`❌ Failed to delete user ${teacher.userId} from auth service`);
          }
        } catch (userDeleteError) {
          deleteResult.failedUserDeletions.push({
            userId: teacher.userId,
            error: 'Error occurred while deleting user from auth service'
          });
          console.error(`❌ Error deleting user ${teacher.userId} from auth service:`, userDeleteError);
        }

        deleteResult.deletedTeachers.push(teacher.id);
        console.log(`✅ Successfully deleted teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.employeeId})`);

      } catch (teacherDeleteError) {
        console.error(`❌ Failed to delete teacher ${teacher.id}:`, teacherDeleteError);
        deleteResult.failedDeletions.push({
          teacherId: teacher.id,
          error: teacherDeleteError instanceof Error ? teacherDeleteError.message : 'Unknown error occurred'
        });
      }
    }

    // Prepare response
    const hasFailures = deleteResult.failedDeletions.length > 0 || deleteResult.failedUserDeletions.length > 0;
    const statusCode = hasFailures ? (deleteResult.deletedTeachers.length > 0 ? 207 : 500) : 200;

    res.status(statusCode).json({
      success: deleteResult.deletedTeachers.length > 0,
      data: {
        summary: {
          totalRequested: teacherIds.length,
          successfulDeletions: deleteResult.deletedTeachers.length,
          failedDeletions: deleteResult.failedDeletions.length,
          deletedUsers: deleteResult.deletedUsers.length,
          failedUserDeletions: deleteResult.failedUserDeletions.length
        },
        results: deleteResult,
        message: hasFailures 
          ? 'Some teachers were deleted successfully, but there were failures'
          : 'All teachers deleted successfully'
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error in deleteTeachers controller:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while deleting teachers' },
      timestamp: new Date().toISOString()
    });
  }
};
