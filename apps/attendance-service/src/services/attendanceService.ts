import { PrismaClient, AttendanceRecord, AttendanceStatus } from '../generated/client';
import type { AttendanceStatus as AttendanceStatusType } from '../validations/attendanceSchemas';

const prisma = new PrismaClient();

export interface AttendanceRecordInput {
  studentId: string;
  status: AttendanceStatusType;
  notes?: string;
}

export interface AttendanceStatsResponse {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  medicalLeaveCount: number;
  attendancePercentage: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export class AttendanceService {
  async markAttendance(
    classId: string,
    sectionId: string,
    attendanceDate: string,
    attendanceRecords: AttendanceRecordInput[],
    attendanceTakerId: string,
    schoolId: string
  ): Promise<AttendanceRecord[]> {
    try {
      // Parse the date
      const parsedDate = new Date(attendanceDate);
      
      // Create or update attendance records in a transaction
      const results = await prisma.$transaction(
        attendanceRecords.map(record =>
          prisma.attendanceRecord.upsert({
            where: {
              studentId_attendanceDate: {
                studentId: record.studentId,
                attendanceDate: parsedDate,
              },
            },
            update: {
              status: record.status as AttendanceStatus,
              notes: record.notes,
              attendanceTakerId,
              updatedAt: new Date(),
            },
            create: {
              studentId: record.studentId,
              schoolId,
              classId,
              sectionId,
              attendanceDate: parsedDate,
              status: record.status as AttendanceStatus,
              attendanceTakerId,
              notes: record.notes,
            },
          })
        )
      );

      return results;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw new Error('Failed to mark attendance');
    }
  }

  async getClassAttendance(
    classId: string,
    sectionId: string,
    date?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceRecord[]> {
    try {
      const whereClause: any = {
        classId,
        sectionId,
      };

      if (date) {
        whereClause.attendanceDate = new Date(date);
      } else if (startDate && endDate) {
        whereClause.attendanceDate = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const records = await prisma.attendanceRecord.findMany({
        where: whereClause,
        orderBy: [
          { attendanceDate: 'desc' },
          { studentId: 'asc' },
        ],
      });

      return records;
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      throw new Error('Failed to fetch class attendance');
    }
  }

  async getStudentAttendance(
    studentId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ records: AttendanceRecord[]; total: number }> {
    try {
      const whereClause: any = { studentId };

      if (startDate && endDate) {
        whereClause.attendanceDate = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [records, total] = await Promise.all([
        prisma.attendanceRecord.findMany({
          where: whereClause,
          orderBy: { attendanceDate: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.attendanceRecord.count({ where: whereClause }),
      ]);

      return { records, total };
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      throw new Error('Failed to fetch student attendance');
    }
  }

  async getAttendanceStats(
    classId: string,
    sectionId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceStatsResponse> {
    try {
      const whereClause = {
        classId,
        sectionId,
        attendanceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };

      // Get all records for the date range
      const records = await prisma.attendanceRecord.findMany({
        where: whereClause,
        select: {
          status: true,
          studentId: true,
        },
      });

      // Get unique students count
      const uniqueStudents = new Set(records.map(r => r.studentId));
      const totalStudents = uniqueStudents.size;

      // Count by status
      const statusCounts = records.reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const presentCount = statusCounts.PRESENT || 0;
      const absentCount = statusCounts.ABSENT || 0;
      const lateCount = statusCounts.LATE || 0;
      const excusedCount = statusCounts.EXCUSED || 0;
      const medicalLeaveCount = statusCounts.MEDICAL_LEAVE || 0;

      const totalRecords = records.length;
      const attendancePercentage = totalRecords > 0 
        ? Math.round(((presentCount + lateCount) / totalRecords) * 100) 
        : 0;

      return {
        totalStudents,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        medicalLeaveCount,
        attendancePercentage,
        dateRange: {
          startDate,
          endDate,
        },
      };
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      throw new Error('Failed to fetch attendance statistics');
    }
  }

  async updateAttendanceRecord(
    recordId: string,
    status: AttendanceStatusType,
    notes?: string
  ): Promise<AttendanceRecord> {
    try {
      const updatedRecord = await prisma.attendanceRecord.update({
        where: { id: recordId },
        data: {
          status: status as AttendanceStatus,
          notes,
          updatedAt: new Date(),
        },
      });

      return updatedRecord;
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw new Error('Failed to update attendance record');
    }
  }

  async getAttendanceForExport(
    classId: string,
    sectionId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceRecord[]> {
    try {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          classId,
          sectionId,
          attendanceDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        orderBy: [
          { attendanceDate: 'asc' },
          { studentId: 'asc' },
        ],
      });

      return records;
    } catch (error) {
      console.error('Error fetching attendance for export:', error);
      throw new Error('Failed to fetch attendance data for export');
    }
  }

  async deleteAttendanceRecord(recordId: string): Promise<void> {
    try {
      await prisma.attendanceRecord.delete({
        where: { id: recordId },
      });
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      throw new Error('Failed to delete attendance record');
    }
  }
}

export const attendanceService = new AttendanceService();
