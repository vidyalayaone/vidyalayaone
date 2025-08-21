import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { createSectionsSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export async function createSections(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(createSectionsSchema, req.body, res);
    if (!validation.success) return;

    const { schoolId, academicYear, sections } = validation.data;
    const adminData = getUser(req);
    const adminId = adminData?.id;
    const role = adminData?.role;    
    const { context } = getSchoolContext(req);

    // Only admin can create sections and only from platform context
    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Sections can only be created from platform context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!adminId || role?.toLowerCase() !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Only admins can create sections' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      res.status(404).json({
        success: false,
        error: { message: 'School not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get all classes for the school and academic year
    const allClasses = await prisma.class.findMany({
      where: {
        schoolId,
        academicYear
      },
      select: {
        id: true,
        name: true
      }
    });

    if (allClasses.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'No classes found for this school and academic year. Please create classes first.' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create a map of class names to class IDs
    const classMap = new Map(allClasses.map(cls => [cls.name, cls.id]));

    // Process sections in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdSections = [];
      const sectionsMap = new Map();

      // Process provided sections
      if (sections && sections.length > 0) {
        for (const sectionGroup of sections) {
          const classId = classMap.get(sectionGroup.className);
          if (!classId) {
            throw new Error(`Class '${sectionGroup.className}' not found`);
          }

          // Track which classes have sections defined
          sectionsMap.set(sectionGroup.className, true);

          // Create sections for this class
          for (const sectionName of sectionGroup.sectionNames) {
            const section = await tx.section.upsert({
              where: {
                classId_name: {
                  classId,
                  name: sectionName
                }
              },
              update: {
                updatedAt: new Date()
              },
              create: {
                classId,
                name: sectionName
              }
            });
            createdSections.push(section);
          }
        }
      }

      // Create default sections for classes without any sections defined
      for (const cls of allClasses) {
        if (!sectionsMap.has(cls.name)) {
          const defaultSection = await tx.section.upsert({
            where: {
              classId_name: {
                classId: cls.id,
                name: 'default'
              }
            },
            update: {
              updatedAt: new Date()
            },
            create: {
              classId: cls.id,
              name: 'default'
            }
          });
          createdSections.push(defaultSection);
        }
      }

      return createdSections;
    });

    res.status(201).json({
      success: true,
      data: {
        message: `Successfully created/updated ${result.length} sections`,
        sections: result,
        schoolId,
        academicYear,
        totalClasses: allClasses.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error creating sections:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { 
          message: 'One or more sections already exist',
          details: error.meta
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Handle custom errors (like class not found)
    if (error.message.includes('not found')) {
      res.status(400).json({
        success: false,
        error: { message: error.message },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while creating sections' },
      timestamp: new Date().toISOString()
    });
  }
}
