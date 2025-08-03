// import { Request, Response } from 'express';
// import bcrypt from 'bcrypt';
// import DatabaseService from '../services/database';
// import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
// import { getTenantContext } from '@vidyalayaone/common-utils';
// import { refreshTokenSchema } from '../validations/validationSchemas';
// import { validateInput } from '../validations/validationHelper';
//
// const { prisma } = DatabaseService;
//
// export async function refreshToken(req: Request, res: Response) {
//   const validation = validateInput(refreshTokenSchema, req.body, res);
//   if (!validation.success) return;
//
//   const { refreshToken } = validation.data;
//   const { context, tenantId } = getTenantContext(req); 
//   const role = req.user?.role; 
//
//   if (context == 'platform' && role!='ADMIN') {
//       res.status(400).json({
//         success: false,
//         error: { message: 'Only admin can refresh token on platform' },
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
//
//   try {
//     const payload = verifyRefreshToken(refreshToken) as any;
//
//     const tokenRecord = await prisma.refreshToken.findUnique({
//       where: { token: refreshToken }
//     });
//
//     if (!tokenRecord || tokenRecord.tenantId !== tenantId) {
//       res.status(401).json({ message: 'Invalid refresh token' });
//       return;
//     }
//
//     const accessToken = generateAccessToken({ userId: payload.userId, role: payload.role, tenantId: null });
//     const newRefreshToken = generateRefreshToken({ userId: payload.userId, role: payload.role, tenantId: null });
//
//     await prisma.refreshToken.update({
//       where: { token: refreshToken },
//       data: { token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
//     });
//
//     res.status(200).json({
//       success: true,
//       data: { accessToken, refreshToken: newRefreshToken },
//       timestamp: new Date().toISOString()
//     });
//     return;
//   } catch {
//     res.status(401).json({ message: 'Invalid or expired refresh token' });
//     return;
//   }
// }
