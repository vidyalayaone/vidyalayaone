// import { Request, Response } from 'express';
// import DatabaseService from '../services/database';
//
// const { prisma } = DatabaseService;
//
// export async function addTenantToAdmin(req: Request, res: Response): Promise<void> {
//   try {
//     const { adminId, tenantId } = req.body;
//
//     if (!adminId) {
//       res.status(400).json({
//         success: false,
//         error: { message: 'Admin Id is required' },
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
//
//     if (!tenantId) {
//       res.status(400).json({
//         success: false,
//         error: { message: 'Tenant Id is required' },
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
//
//     // Check if admin exists first
//     const existingAdmin = await prisma.user.findUnique({
//       where: { id: adminId }
//     });
//
//     if (!existingAdmin) {
//       res.status(404).json({
//         success: false,
//         error: { message: 'Admin not found' },
//         timestamp: new Date().toISOString()
//       });
//       return;
//     }
//
//     const updatedAdmin = await prisma.user.update({
//       where: { id: adminId },
//       data: { tenantId },
//     });
//
//     res.status(200).json({
//       success: true,
//       message: "Tenant added to admin successfully.",
//       timestamp: new Date().toISOString()
//     });
//     return;
//   } catch (error) {
//     console.error('Add tenant to admin error:', error);
//     res.status(500).json({
//       success: false,
//       error: { message: 'Failed to add tenant to admin' },
//       timestamp: new Date().toISOString()
//     });
//     return;
//   }
// }
