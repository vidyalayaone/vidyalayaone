// import { Request, Response } from 'express';
// import bcrypt from 'bcrypt';
// import DatabaseService from '../services/database';
// import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
// import { getTenantContext } from '@vidyalayaone/common-utils';
// import { loginSchema } from '../validations/validationSchemas';
// import { validateInput } from '../validations/validationHelper';
//
// const { prisma } = DatabaseService;
//
// export async function login(req: Request, res: Response) {
//   try {
//     const validation = validateInput(loginSchema, req.body, res);
//     if (!validation.success) return;
//
//     const { email, username, password, role } = validation.data;
//     const { context, tenantId } = getTenantContext(req);
//
//     if (context == 'platform' && role!='ADMIN') {
//       res.status(400).json({
//         success: false,
//         error: { message: 'Only admin can login on platform' },
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
//
//     const identifier = email || username;
//
//     const user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { email: identifier },
//           { username: identifier }
//         ],
//         tenantId,
//         role: role as any
//       }
//     });
//
//     if (!user) {
//       res.status(401).json({
//         success: false,
//         error: { message: 'Invalid email or username' },
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
//
//     if (!user.isVerified) {
//       res.status(401).json({
//         success: false,
//         error: { message: 'Unverified email' },
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
//
//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) {
//       res.status(401).json({
//         success: false,
//         error: { message: 'Invalid password' },
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
//
//     const accessToken = generateAccessToken({ 
//       userId: user.id,
//       role: user.role,
//       tenantId: user.tenantId
//     });
//
//     const refreshToken = generateRefreshToken({ 
//       userId: user.id,
//       role: user.role,
//       tenantId: user.tenantId
//     });
//
//     await prisma.refreshToken.create({
//       data: { 
//         token: refreshToken, 
//         userId: user.id,
//         tenantId: user.tenantId,
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//       }
//     });
//
//     res.status(200).json({
//       success: true,
//       data: { accessToken, refreshToken },
//       timestamp: new Date().toISOString()
//     });
//     return;
//   } catch (error: any) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       error: { message: 'Login failed' },
//       timestamp: new Date().toISOString()
//     });
//     return;
//   }
// }
