import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser, validateInput } from '@vidyalayaone/common-utils';
import { updateAdminWithSubdomainSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export async function updateAdminWithSubdomain(req: Request, res: Response) {
  try {
    const validation = validateInput(updateAdminWithSubdomainSchema, req.body, res);
    if (!validation.success) return;

    const { subdomain } = validation.data;

    const userData = getUser(req);
    const userId = userData?.id;
    const role = userData?.role;

    const { context } = getSchoolContext(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Unauthenticated' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Provided context must be platform' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { message: 'Role must be ADMIN' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        subdomain,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Subdomain updated successfully',
      data: { user_id: userId, subdomain },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error: any) {
    console.error('Error in updateAdminWithSubdomain:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', details: error.message },
      timestamp: new Date().toISOString()
    });
    return;
  }

}
