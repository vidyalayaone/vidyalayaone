import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { createClassSubjectsSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function createClassSubjects(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(createClassSubjectsSchema, req.body, res);
    if (!validation.success) return;

    const { schoolId, academicYear, classSubjects } = validation.data;
    const userData = getUser(req);
    const userId = userData?.id;
    const { context } = getSchoolContext(req);

    // Only admin can add subjects to classes and only from platform context
    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Class subjects can only be managed from platform context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!hasPermission(PERMISSIONS.CLASS.UPDATE, userData)){
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to manage class subjects' },
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

    // Get all subject names mentioned in the request
    const allSubjectNames = classSubjects.flatMap(cs => cs.subjectNames);
    const uniqueSubjectNames = [...new Set(allSubjectNames)];

    // Verify all subjects exist
    const existingSubjects = await prisma.subject.findMany({
      where: {
        name: {
          in: uniqueSubjectNames
        }
      },
      select: {
        id: true,
        code: true,
        name: true
      }
    });

    const existingSubjectNames = new Set(existingSubjects.map(s => s.name));
    const missingSubjectNames = uniqueSubjectNames.filter(name => !existingSubjectNames.has(name));

    if (missingSubjectNames.length > 0) {
      res.status(400).json({
        success: false,
        error: { 
          message: `The following subject names do not exist: ${missingSubjectNames.join(', ')}. Please create these subjects first using the global subjects endpoint.` 
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create a map of subject names to subject IDs
    const subjectMap = new Map(existingSubjects.map(subj => [subj.name, subj.id]));

    // Process class subjects in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedClasses = [];

      for (const classSubject of classSubjects) {
        const classId = classMap.get(classSubject.className);
        if (!classId) {
          throw new Error(`Class '${classSubject.className}' not found`);
        }

        // Get subject IDs for this class
        const subjectIds = classSubject.subjectNames.map(name => {
          const subjectId = subjectMap.get(name);
          if (!subjectId) {
            throw new Error(`Subject with name '${name}' not found`);
          }
          return subjectId;
        });

        // Update the class with the subjects (this will replace existing subjects)
        const updatedClass = await tx.class.update({
          where: { id: classId },
          data: {
            subjects: {
              set: subjectIds.map(id => ({ id }))
            }
          },
          include: {
            subjects: {
              select: {
                id: true,
                name: true,
                code: true,
                description: true
              }
            }
          }
        });

        updatedClasses.push({
          className: classSubject.className,
          classId: classId,
          subjects: updatedClass.subjects,
          totalSubjects: updatedClass.subjects.length
        });
      }

      return updatedClasses;
    });

    res.status(200).json({
      success: true,
      data: {
        message: `Successfully updated subjects for ${result.length} classes`,
        classSubjects: result,
        schoolId,
        academicYear,
        totalClassesUpdated: result.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error managing class subjects:', error);
    
    // Handle custom errors (like class not found, subject not found)
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
      error: { message: 'Internal server error while managing class subjects' },
      timestamp: new Date().toISOString()
    });
  }
}
