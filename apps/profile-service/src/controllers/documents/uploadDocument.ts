import { Request, Response } from 'express';
import multer from 'multer';
import StorageService from '../../services/storage';
import DatabaseService from '../../services/database';
import { getUser } from '@vidyalayaone/common-utils';

const upload = multer({ storage: multer.memoryStorage() });
export const multerUpload = upload.single('file');

export async function uploadDocument(req: Request, res: Response) {
  try {
    const user = getUser(req);

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ success: false, error: { message: 'File is required' } });
      return;
    }

    const key = `documents/${new Date().toISOString().slice(0,10)}/${Date.now()}-${file.originalname}`;

    await StorageService.upload({ key, body: file.buffer, contentType: file.mimetype });

    const { prisma } = DatabaseService;
  const doc = await prisma.document.create({
      data: {
        name: file.originalname,
        url: key, // store key; we'll sign on demand
        mimeType: file.mimetype,
        fileSize: BigInt(file.size),
        type: 'OTHER',
    uploadedBy: (user as any)?.id || null,
      },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to upload document' } });
  }
}
