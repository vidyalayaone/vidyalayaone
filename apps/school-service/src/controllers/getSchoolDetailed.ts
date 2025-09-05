import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, getUser } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function getSchoolDetailed(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params;
    const userData = getUser(req);

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!await hasPermission(PERMISSIONS.SCHOOL.GET, userData)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to view school details' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get school with all related data
    const school = await prisma.school.findUnique({
      where: { 
        id: schoolId,
      },
      include: {
        classes: {
          include: {
            sections: true,
            subjects: true,
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!school) {
      res.status(404).json({
        success: false,
        error: { message: 'School not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Calculate totals
    const totalSections = school.classes.reduce((total, cls) => total + cls.sections.length, 0);
    const totalSubjects = school.classes.reduce((total, cls) => total + cls.subjects.length, 0);

    // Calculate setup progress
    const hasClasses = school.classes.length > 0;
    const hasSections = totalSections > 0;
    const hasSubjects = totalSubjects > 0;
    
    // Get plan info from metadata
    const metaData = school.metaData as any || {};
    const plan = metaData.plan;
    const hasPayment = plan && plan.type && plan.type !== 'trial';

    const setupProgress = {
      schoolCreated: true, // School exists
      classesAdded: hasClasses,
      sectionsAdded: hasSections,
      subjectsAdded: hasSubjects,
      paymentCompleted: hasPayment,
    };

    res.status(200).json({
      success: true,
      data: {
        school: {
          id: school.id,
          name: school.name,
          subdomain: school.subdomain,
          address: school.address,
          level: school.level,
          board: school.board,
          schoolCode: school.schoolCode,
          phoneNumbers: school.phoneNumbers,
          email: school.email,
          principalName: school.principalName,
          establishedYear: school.establishedYear,
          language: school.language,
          metaData: school.metaData,
          fullUrl: `https://${school.subdomain}.vidyalayaone.com`,
          isActive: school.isActive,
          createdAt: school.createdAt,
          updatedAt: school.updatedAt,
        },
        classes: school.classes.map(cls => ({
          id: cls.id,
          name: cls.name,
          academicYear: cls.academicYear,
          sections: cls.sections.map(section => ({
            id: section.id,
            name: section.name,
            classTeacherId: section.classTeacherId,
            metaData: section.metaData,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt,
          })),
          subjects: cls.subjects.map(subject => ({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            description: subject.description,
            metaData: subject.metaData,
            createdAt: subject.createdAt,
            updatedAt: subject.updatedAt,
          })),
          metaData: cls.metaData,
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt,
        })),
        totalSections,
        totalSubjects,
        setupProgress,
      },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Get detailed school error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch detailed school information' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
