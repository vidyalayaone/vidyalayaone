import { Request, Response } from 'express';
import DatabaseService from '../../services/database';
import { getSchoolContext, getUser, validateInput } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { listDocumentsQuerySchema, documentParamsSchema } from '../../validations/validationSchemas';

const { prisma } = DatabaseService;

// List documents for a student (no storage interaction, URL saved in DB)
export async function listStudentDocuments(req: Request, res: Response) {
  try {
    // Validate params
    // const paramsValidation = validateInput(documentParamsSchema, req.params, res);
    // if (!paramsValidation.success) return;
    
    // Validate query parameters
    const queryValidation = validateInput(listDocumentsQuerySchema, req.query, res);
    if (!queryValidation.success) return;

    const { id: studentId } = req.params;
    const { page = '1', pageSize = '20' } = queryValidation.data;

    if (!studentId) {
      res.status(400).json({ success: false, error: { message: 'Student ID is required' }, timestamp: new Date().toISOString() });
      return;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 20));
    const skip = (pageNum - 1) * pageSizeNum;

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

    if (student.schoolId !== schoolId) {
      res.status(403).json({ success: false, error: { message: 'Access denied. Student does not belong to your school' }, timestamp: new Date().toISOString() });
      return;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: { studentId: studentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSizeNum,
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
      }),
      prisma.document.count({ where: { studentId: studentId } }),
    ]);

    // Convert BigInt fileSize to string for JSON serialization
    const documentsResponse = documents.map((doc: any) => ({
      ...doc,
      fileSize: doc.fileSize ? doc.fileSize.toString() : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        documents: documentsResponse,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          total,
          totalPages: Math.ceil(total / pageSizeNum),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error listing student documents:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error while listing documents' }, timestamp: new Date().toISOString() });
  }
}
