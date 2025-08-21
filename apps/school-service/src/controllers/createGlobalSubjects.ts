import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { createGlobalSubjectsSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export async function createGlobalSubjects(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(createGlobalSubjectsSchema, req.body, res);
    if (!validation.success) return;

    const { subjects } = validation.data;
    const adminData = getUser(req);
    const adminId = adminData?.id;
    const role = adminData?.role;    
    const { context } = getSchoolContext(req);

    // Only admin can create global subjects and only from platform context
    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Global subjects can only be created from platform context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!adminId || role?.toLowerCase() !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Only admins can create global subjects' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create subjects in a transaction
    const createdSubjects = await prisma.$transaction(async (tx) => {
      const subjectPromises = subjects.map(subject => 
        tx.subject.upsert({
          where: {
            name: subject.name
          },
          update: {
            code: subject.code,
            description: subject.description,
            updatedAt: new Date()
          },
          create: {
            name: subject.name,
            code: subject.code,
            description: subject.description || null
          }
        })
      );

      return Promise.all(subjectPromises);
    });

    res.status(201).json({
      success: true,
      data: {
        message: `Successfully created/updated ${createdSubjects.length} global subjects`,
        subjects: createdSubjects
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error creating global subjects:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { 
          message: 'One or more subject codes already exist',
          details: error.meta
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while creating global subjects' },
      timestamp: new Date().toISOString()
    });
  }
}
