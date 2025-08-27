import { Request, Response } from 'express';
import DatabaseService from '../../services/database';
import StorageService from '../../services/storage';

export async function getDocument(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { prisma } = DatabaseService;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      res.status(404).json({ success: false, error: { message: 'Document not found' } });
      return;
    }
    const signedUrl = await StorageService.getSignedUrl(doc.url);
    res.status(200).json({ success: true, data: { ...doc, signedUrl } });
  } catch (err) {
    console.error('Get document error:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to get document' } });
  }
}
