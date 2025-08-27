import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getSectionTimetable(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId, classId, sectionId } = req.params;

    if (!schoolId || !classId || !sectionId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID, Class ID, and Section ID are required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userData = getUser(req);
    const { context } = getSchoolContext(req);

    // Check permissions
    if (!await hasPermission(PERMISSIONS.CLASS.VIEW_TIMETABLE, userData)) {
      res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You do not have permission to view timetable' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify section exists
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        classId: classId,
        class: {
          schoolId: schoolId
        }
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            schoolId: true
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

    // For now, return mock timetable data since timetable schema might not be implemented yet
    // In a full implementation, you would query actual timetable records
    const mockTimetable = {
      monday: [
        { id: '1', period: 1, startTime: '09:00', endTime: '09:45', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'A101' },
        { id: '2', period: 2, startTime: '09:45', endTime: '10:30', subject: 'English', teacher: 'Ms. Johnson', room: 'B201' },
        { id: '3', period: 3, startTime: '10:45', endTime: '11:30', subject: 'Science', teacher: 'Mr. Brown', room: 'C301' },
        { id: '4', period: 4, startTime: '11:30', endTime: '12:15', subject: 'History', teacher: 'Ms. Davis', room: 'A102' },
        { id: '5', period: 5, startTime: '13:00', endTime: '13:45', subject: 'Geography', teacher: 'Mr. Wilson', room: 'B202' }
      ],
      tuesday: [
        { id: '6', period: 1, startTime: '09:00', endTime: '09:45', subject: 'Science', teacher: 'Mr. Brown', room: 'C301' },
        { id: '7', period: 2, startTime: '09:45', endTime: '10:30', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'A101' },
        { id: '8', period: 3, startTime: '10:45', endTime: '11:30', subject: 'English', teacher: 'Ms. Johnson', room: 'B201' },
        { id: '9', period: 4, startTime: '11:30', endTime: '12:15', subject: 'Physical Education', teacher: 'Coach Taylor', room: 'Gym' },
        { id: '10', period: 5, startTime: '13:00', endTime: '13:45', subject: 'Art', teacher: 'Ms. Garcia', room: 'Art Room' }
      ],
      wednesday: [
        { id: '11', period: 1, startTime: '09:00', endTime: '09:45', subject: 'English', teacher: 'Ms. Johnson', room: 'B201' },
        { id: '12', period: 2, startTime: '09:45', endTime: '10:30', subject: 'History', teacher: 'Ms. Davis', room: 'A102' },
        { id: '13', period: 3, startTime: '10:45', endTime: '11:30', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'A101' },
        { id: '14', period: 4, startTime: '11:30', endTime: '12:15', subject: 'Geography', teacher: 'Mr. Wilson', room: 'B202' },
        { id: '15', period: 5, startTime: '13:00', endTime: '13:45', subject: 'Science', teacher: 'Mr. Brown', room: 'C301' }
      ],
      thursday: [
        { id: '16', period: 1, startTime: '09:00', endTime: '09:45', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'A101' },
        { id: '17', period: 2, startTime: '09:45', endTime: '10:30', subject: 'Science', teacher: 'Mr. Brown', room: 'C301' },
        { id: '18', period: 3, startTime: '10:45', endTime: '11:30', subject: 'History', teacher: 'Ms. Davis', room: 'A102' },
        { id: '19', period: 4, startTime: '11:30', endTime: '12:15', subject: 'English', teacher: 'Ms. Johnson', room: 'B201' },
        { id: '20', period: 5, startTime: '13:00', endTime: '13:45', subject: 'Computer Science', teacher: 'Mr. Lee', room: 'Computer Lab' }
      ],
      friday: [
        { id: '21', period: 1, startTime: '09:00', endTime: '09:45', subject: 'Geography', teacher: 'Mr. Wilson', room: 'B202' },
        { id: '22', period: 2, startTime: '09:45', endTime: '10:30', subject: 'Art', teacher: 'Ms. Garcia', room: 'Art Room' },
        { id: '23', period: 3, startTime: '10:45', endTime: '11:30', subject: 'Physical Education', teacher: 'Coach Taylor', room: 'Gym' },
        { id: '24', period: 4, startTime: '11:30', endTime: '12:15', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'A101' },
        { id: '25', period: 5, startTime: '13:00', endTime: '13:45', subject: 'English', teacher: 'Ms. Johnson', room: 'B201' }
      ]
    };

    res.status(200).json({
      success: true,
      data: {
        timetable: mockTimetable,
        section: {
          id: section.id,
          name: section.name
        },
        class: {
          id: section.class.id,
          name: section.class.name,
          academicYear: section.class.academicYear
        },
        metadata: {
          weekStartsOn: 'monday',
          totalPeriods: 5,
          breakTimes: [
            { name: 'Short Break', startTime: '10:30', endTime: '10:45' },
            { name: 'Lunch Break', startTime: '12:15', endTime: '13:00' }
          ],
          lastUpdated: new Date().toISOString()
        }
      },
      message: 'Mock timetable data provided. Replace with actual timetable service when available.',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching section timetable:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching section timetable' },
      timestamp: new Date().toISOString()
    });
  }
}
