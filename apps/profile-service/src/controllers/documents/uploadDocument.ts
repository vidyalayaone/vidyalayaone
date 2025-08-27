import { Request, Response } from 'express';
import DatabaseService from '../../services/database';
import { getSchoolContext, getUser, validateInput } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { createDocumentSchema, documentParamsSchema } from '../../validations/validationSchemas';

const { prisma } = DatabaseService;

// Minimal controller to create a document record for a student without file storage.
// Expects body: { name, type, url, description?, mimeType?, fileSize?, expiryDate? }
export async function createStudentDocument(req: Request, res: Response) {
	try {
		// Validate params
		// const paramsValidation = validateInput(documentParamsSchema, req.params, res);
		// if (!paramsValidation.success) return;
		
		// Validate body
		const bodyValidation = validateInput(createDocumentSchema, req.body, res);
		if (!bodyValidation.success) return;

		const { id: studentId } = req.params;
		const { name, type, url, description, mimeType, fileSize, expiryDate } = bodyValidation.data;

		if (!studentId) {
			res.status(400).json({ success: false, error: { message: 'Student ID is required' }, timestamp: new Date().toISOString() });
			return;
		}

		const { context, schoolId } = getSchoolContext(req);
		const user = getUser(req);

		if (context !== 'school') {
			res.status(400).json({ success: false, error: { message: 'Document creation is only allowed in school context' }, timestamp: new Date().toISOString() });
			return;
		}

		if (!schoolId) {
			res.status(400).json({ success: false, error: { message: 'School ID is required from context' }, timestamp: new Date().toISOString() });
			return;
		}

		if (!(await hasPermission(PERMISSIONS.STUDENT.UPDATE, user))) {
			res.status(403).json({ success: false, error: { message: 'You do not have permission to manage student documents' }, timestamp: new Date().toISOString() });
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

		// Create document record
		const created = await prisma.document.create({
			data: {
				name,
				type,
				url,
				description: description || null,
				mimeType: mimeType || 'application/octet-stream',
				fileSize: fileSize ? BigInt(fileSize) : null,
				expiryDate: expiryDate ? new Date(expiryDate) : null,
				uploadedBy: user?.id || null,
				studentId: studentId,
			},
		});

		// Convert BigInt to string for JSON serialization
		const documentResponse = {
			...created,
			fileSize: created.fileSize ? created.fileSize.toString() : null,
		};

		res.status(201).json({
			success: true,
			data: { document: documentResponse },
			message: 'Document created',
			timestamp: new Date().toISOString(),
		});
	} catch (error: any) {
		console.error('Error creating student document:', error);
		res.status(500).json({ success: false, error: { message: 'Internal server error while creating document' }, timestamp: new Date().toISOString() });
	}
}

