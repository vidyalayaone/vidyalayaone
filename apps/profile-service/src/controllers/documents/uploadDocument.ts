import { Request, Response } from 'express';
import DatabaseService from '../../services/database';
import StorageService from '../../services/storage';
import { getSchoolContext, getUser, validateInput } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { uploadDocumentSchema, createDocumentSchema, documentParamsSchema } from '../../validations/validationSchemas';

const { prisma } = DatabaseService;

// Enhanced controller to upload a document file to cloud storage and create a database record
// Expects a multipart/form-data request with 'document' file field and form fields: { name, type, description?, expiryDate? }
export async function uploadStudentDocument(req: Request, res: Response) {
	try {
		// Check if file was uploaded
		if (!req.file) {
			res.status(400).json({ 
				success: false, 
				error: { message: 'No file uploaded. Please provide a file in the "document" field' }, 
				timestamp: new Date().toISOString() 
			});
			return;
		}

		// Validate body (form fields)
		const bodyValidation = validateInput(uploadDocumentSchema, req.body, res);
		if (!bodyValidation.success) return;

		const { id: studentId } = req.params;
		const { name, type, description, expiryDate } = bodyValidation.data;

		if (!studentId) {
			res.status(400).json({ 
				success: false, 
				error: { message: 'Student ID is required' }, 
				timestamp: new Date().toISOString() 
			});
			return;
		}

		const { context, schoolId } = getSchoolContext(req);
		const user = getUser(req);

		if (context !== 'school') {
			res.status(400).json({ 
				success: false, 
				error: { message: 'Document upload is only allowed in school context' }, 
				timestamp: new Date().toISOString() 
			});
			return;
		}

		if (!schoolId) {
			res.status(400).json({ 
				success: false, 
				error: { message: 'School ID is required from context' }, 
				timestamp: new Date().toISOString() 
			});
			return;
		}

		if (!(await hasPermission(PERMISSIONS.STUDENT.UPDATE, user))) {
			res.status(403).json({ 
				success: false, 
				error: { message: 'You do not have permission to manage student documents' }, 
				timestamp: new Date().toISOString() 
			});
			return;
		}

		// Ensure student exists and belongs to the same school
		const student = await prisma.student.findUnique({ where: { id: studentId } });
		if (!student) {
			res.status(404).json({ 
				success: false, 
				error: { message: 'Student not found' }, 
				timestamp: new Date().toISOString() 
			});
			return;
		}

		if (student.status !== 'ACCEPTED') {
			res.status(403).json({ 
				success: false,
				error: { message: 'Cannot upload document. Student is not in ACCEPTED status' },
				timestamp: new Date().toISOString() 
			});
			return;
		}

		if (student.schoolId !== schoolId) {
			res.status(403).json({ 
				success: false, 
				error: { message: 'Access denied. Student does not belong to your school' }, 
				timestamp: new Date().toISOString() 
			});
			return;
		}

		// Upload file to cloud storage
		let uploadResult;
		try {
			uploadResult = await StorageService.uploadFile(req.file, `students/${studentId}/documents`);
		} catch (storageError) {
			console.error('Storage upload error:', storageError);
			res.status(500).json({ 
				success: false, 
				error: { message: 'Failed to upload file to cloud storage' }, 
				timestamp: new Date().toISOString() 
			});
			return;
		}

		// Create document record in database
		try {
			const created = await prisma.document.create({
				data: {
					name,
					type,
					url: uploadResult.url,
					description: description || null,
					mimeType: uploadResult.mimeType,
					fileSize: BigInt(uploadResult.size),
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
				message: 'Document uploaded and created successfully',
				timestamp: new Date().toISOString(),
			});
		} catch (dbError) {
			// If database creation fails, try to clean up the uploaded file
			try {
				await StorageService.deleteFile(`students/${studentId}/documents/${uploadResult.fileName}`);
			} catch (deleteError) {
				console.error('Failed to cleanup uploaded file after database error:', deleteError);
			}

			console.error('Database error creating document:', dbError);
			res.status(500).json({ 
				success: false, 
				error: { message: 'Failed to create document record in database' }, 
				timestamp: new Date().toISOString() 
			});
			return;
		}

	} catch (error: any) {
		console.error('Error uploading student document:', error);
		res.status(500).json({ 
			success: false, 
			error: { message: 'Internal server error while uploading document' }, 
			timestamp: new Date().toISOString() 
		});
	}
}

// Keep the original function for backward compatibility (for cases where URL is provided directly)