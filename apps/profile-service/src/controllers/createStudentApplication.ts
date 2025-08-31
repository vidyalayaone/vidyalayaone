import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, validateInput } from '@vidyalayaone/common-utils';
import { createStudentSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export const createStudentApplication = async (req: Request, res: Response) => {
  try {
    // Validate input - create a simplified schema for applications
    const applicationSchema = createStudentSchema.omit({
      classId: true,
      sectionId: true,
      academicYear: true,
      rollNumber: true,
      admissionNumber: true,
      admissionDate: true
    });
    
    const validation = validateInput(applicationSchema, req.body, res);
    if (!validation.success) return;
    
    const {
      firstName,
      lastName,
      bloodGroup,
      category,
      religion,
      dateOfBirth,
      gender,
      address,
      contactInfo,
      parentInfo,
      documents,
    } = validation.data;

    // Get school context for public application
    const { schoolId } = getSchoolContext(req);
    
    // For public applications, we need schoolId from the subdomain context
    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School not found. Please ensure you are accessing the correct school portal.' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Process guardian data - convert parentInfo to guardians format if needed
    let processedGuardians: any[] = [];
    
    // Process parent information into guardian format
    if (parentInfo) {
      // Add father as guardian
      if (parentInfo.fatherName) {
        processedGuardians.push({
          firstName: parentInfo.fatherName.split(' ')[0] || parentInfo.fatherName,
          lastName: parentInfo.fatherName.split(' ').slice(1).join(' ') || '',
          phone: parentInfo.fatherPhone,
          email: null,
          relation: 'FATHER',
          address: address, // Use student's address as default
        });
      }
      
      // Add mother as guardian
      if (parentInfo.motherName) {
        processedGuardians.push({
          firstName: parentInfo.motherName.split(' ')[0] || parentInfo.motherName,
          lastName: parentInfo.motherName.split(' ').slice(1).join(' ') || '',
          phone: parentInfo.motherPhone,
          email: null,
          relation: 'MOTHER',
          address: address, // Use student's address as default
        });
      }
      
      // Add guardian if different from parents
      if (parentInfo.guardianName) {
        processedGuardians.push({
          firstName: parentInfo.guardianName.split(' ')[0] || parentInfo.guardianName,
          lastName: parentInfo.guardianName.split(' ').slice(1).join(' ') || '',
          phone: parentInfo.guardianPhone,
          email: null,
          relation: parentInfo.guardianRelation || 'GUARDIAN',
          address: address, // Use student's address as default
        });
      }
    }

    // Ensure we have at least one guardian
    if (processedGuardians.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'At least one guardian is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      // Create student application with guardians and documents in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create student with status PENDING and userId as null
        const student = await tx.student.create({
          data: {
            schoolId,
            firstName,
            lastName,
            bloodGroup,
            category,
            religion,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender,
            address,
            contactInfo: contactInfo,
            profilePhoto: null, // Set to null for now, can be updated later
            status: 'PENDING', // Set status to PENDING for applications
          },
        });

        // Create guardians and link them to the student
        const guardianPromises = processedGuardians.map(async (guardianData) => {
          // Create guardian
          const guardian = await tx.guardian.create({
            data: {
              firstName: guardianData.firstName,
              lastName: guardianData.lastName,
              phone: guardianData.phone,
              email: guardianData.email,
              address: guardianData.address,
            },
          });

          // Link guardian to student
          await tx.studentGuardian.create({
            data: {
              studentId: student.id,
              guardianId: guardian.id,
              relation: guardianData.relation,
            },
          });

          return guardian;
        });

        await Promise.all(guardianPromises);

        // Note: No enrollment is created for applications
        // Enrollment will be handled separately when the application is approved

        // Create documents if provided
        if (documents && documents.length > 0) {
          const documentPromises = documents.map(async (doc) => {
            if (!doc) return null;
            
            return await tx.document.create({
              data: {
                name: doc.name,
                description: doc.description,
                type: doc.type as any, // Will be validated by Prisma enum
                url: doc.base64Data ? `data:${doc.mimeType};base64,${doc.base64Data}` : '',
                mimeType: doc.mimeType,
                fileSize: doc.fileSize ? BigInt(doc.fileSize) : null,
                studentId: student.id,
                uploadedBy: null, // No user context in unprotected route
                isVerified: false,
              },
            });
          });

          await Promise.all(documentPromises);
        }

        return { student };
      });

      // Fetch the complete student data with relations
      const createdStudent = await prisma.student.findUnique({
        where: { id: result.student.id },
        include: {
          guardians: {
            include: {
              guardian: true,
            },
          },
          documents: true,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          student: createdStudent,
          message: 'Student application submitted successfully and is pending approval',
        },
        timestamp: new Date().toISOString(),
      });

    } catch (transactionError) {
      console.error('❌ Transaction failed:', transactionError);
      
      // Handle specific Prisma errors
      if (transactionError instanceof Error && 'code' in transactionError && transactionError.code === 'P2002') {
        res.status(400).json({
          success: false,
          error: { message: 'Student with this admission number already exists for this school' },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: { message: 'Internal server error while creating student application' },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error creating student application:', error);
    
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while creating student application' },
      timestamp: new Date().toISOString()
    });
  }
}
