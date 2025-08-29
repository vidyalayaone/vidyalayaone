import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { updateAttendanceSchema } from '../validations/attendanceSchemas';

const { prisma } = DatabaseService;

export async function updateAttendanceRecord(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(
      updateAttendanceSchema,
      { params: req.params, body: req.body },
      res
    );
    if (!validation.success) return;

    const { recordId } = validation.data.params;
    const { status, notes } = validation.data.body;
    const userData = getUser(req);
    const userId = userData?.id;
    const { context, schoolId } = getSchoolContext(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'User authentication required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if the attendance record exists and belongs to the school
    const existingRecord = await prisma.studentAttendance.findFirst({
      where: {
        id: recordId,
        schoolId: schoolId
      }
    });

    if (!existingRecord) {
      res.status(404).json({
        success: false,
        error: { message: 'Attendance record not found in your school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update the attendance record
    const updatedRecord = await prisma.studentAttendance.update({
      where: {
        id: recordId
      },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: {
        attendanceRecord: updatedRecord,
        meta: {
          updatedBy: userId,
          updatedAt: updatedRecord.updatedAt
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while updating attendance record' },
      timestamp: new Date().toISOString()
    });
  }
}
