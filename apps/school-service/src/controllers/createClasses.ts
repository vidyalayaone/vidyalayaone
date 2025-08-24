import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { createClassesSchema } from '../validations/validationSchemas';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

export async function createClasses(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(createClassesSchema, req.body, res);
    if (!validation.success) return;

    const { schoolId, classes, academicYear } = validation.data;
    const user = getUser(req);
    const userId = user?.id;
    const { context } = getSchoolContext(req);

    // Only admin can create classes and only from platform context
    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Classes can only be created from platform context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!await hasPermission(PERMISSIONS.CLASS.CREATE, user)) {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions to create classes' },
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

    // Create classes in a transaction
    const createdClasses = await prisma.$transaction(async (tx) => {
      const classPromises = classes.map(className => 
        tx.class.upsert({
          where: {
            schoolId_name_academicYear: {
              schoolId,
              name: className,
              academicYear
            }
          },
          update: {
            updatedAt: new Date()
          },
          create: {
            schoolId,
            name: className,
            academicYear
          }
        })
      );

      return Promise.all(classPromises);
    });

    res.status(201).json({
      success: true,
      data: {
        message: `Successfully created/updated ${createdClasses.length} classes for school`,
        classes: createdClasses,
        schoolId,
        academicYear
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error creating classes:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { 
          message: 'One or more classes already exist for this school and academic year',
          details: error.meta
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while creating classes' },
      timestamp: new Date().toISOString()
    });
  }
}
