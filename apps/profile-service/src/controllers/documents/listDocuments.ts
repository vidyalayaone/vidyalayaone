import { Request, Response } from 'express';
import DatabaseService from '../../services/database';

export async function listDocuments(req: Request, res: Response) {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const skip = (page - 1) * limit;
    const { prisma } = DatabaseService;

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.count(),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('List documents error:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to list documents' } });
  }
}
