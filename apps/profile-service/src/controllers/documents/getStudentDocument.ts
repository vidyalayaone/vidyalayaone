import { Request, Response } from 'express';
import DatabaseService from '../../services/database';
import { getSchoolContext, getUser, validateInput } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { documentParamsSchema } from '../../validations/validationSchemas';

const { prisma } = DatabaseService;

// Get a single student document (returns DB record including URL)
export async function getStudentDocument(req: Request, res: Response) {
  try {
    // Validate params (expecting both id and docId)
    // const paramsValidation = validateInput(
    //   documentParamsSchema.extend({ 
    //     docId: documentParamsSchema.shape.docId.unwrap() // Make docId required for this endpoint
    //   }), 
    //   req.params, 
    //   res
    // );
    // if (!paramsValidation.success) return;

    const { id: studentId, docId } = req.params;

    const { context, schoolId } = getSchoolContext(req);
    const user = getUser(req);

    if (context !== 'school') {
      res.status(400).json({ success: false, error: { message: 'Document access is only allowed in school context' }, timestamp: new Date().toISOString() });
      return;
    }

    if (!schoolId) {
      res.status(400).json({ success: false, error: { message: 'School ID is required from context' }, timestamp: new Date().toISOString() });
      return;
    }

    if (!(await hasPermission(PERMISSIONS.STUDENT.VIEW, user))) {
      res.status(403).json({ success: false, error: { message: 'You do not have permission to view student documents' }, timestamp: new Date().toISOString() });
      return;
    }

    // Ensure student exists and belongs to the same school
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(404).json({ success: false, error: { message: 'Student not found' }, timestamp: new Date().toISOString() });
      return;
    }
    
    if (student.status !== 'ACCEPTED') {
      res.status(403).json({ success: false, error: { message: 'Access denied. Student is not in ACCEPTED status' }, timestamp: new Date().toISOString() });
      return;
    }
    if (student.schoolId !== schoolId) {
      res.status(403).json({ success: false, error: { message: 'Access denied. Student does not belong to your school' }, timestamp: new Date().toISOString() });
      return;
    }

    const document = await prisma.document.findFirst({
      where: { id: docId, studentId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        url: true,
        mimeType: true,
        fileSize: true,
        uploadedBy: true,
        isVerified: true,
        expiryDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!document) {
      res.status(404).json({ success: false, error: { message: 'Document not found' }, timestamp: new Date().toISOString() });
      return;
    }

    // Convert BigInt to string for JSON serialization
    const documentResponse = {
      ...document,
      fileSize: document.fileSize ? document.fileSize.toString() : null,
    };

    res.status(200).json({ success: true, data: { document: documentResponse }, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Error fetching student document:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error while fetching document' }, timestamp: new Date().toISOString() });
  }
}
