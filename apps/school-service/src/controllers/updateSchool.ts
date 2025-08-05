import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { getSchoolContext, validateInput, getUser } from '@vidyalayaone/common-utils';
import { updateSchoolSchema } from '../validations/validationSchemas';

const { prisma } = DatabaseService;

export async function updateSchool(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params;
    
    const validation = validateInput(updateSchoolSchema, req.body, res);
    if (!validation.success) return;

    const { name, subdomain, address, level, board, schoolCode, phoneNumbers, email, principalName, establishedYear, language, metaData } = validation.data;

    const adminData = getUser(req);
    const adminId = adminData?.id;
    const role = adminData?.role;
    const { context } = getSchoolContext(req);

    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Provided context must be platform' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!adminId) {
      res.status(401).json({
        success: false,
        error: { message: 'User authentication required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (role !== 'ADMIN') {
      res.status(400).json({
        success: false,
        error: { message: 'Only ADMIN can update school' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!schoolId) {
      res.status(400).json({
        success: false,
        error: { message: 'School ID parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Find the existing school
    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!existingSchool) {
      res.status(404).json({
        success: false,
        error: { message: 'School not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check for conflicts with other schools (exclude current school)
    if (name && name !== existingSchool.name) {
      const existingName = await prisma.school.findFirst({
        where: { 
          name, 
          id: { not: schoolId } 
        }
      });
      
      if (existingName) {
        res.status(409).json({
          success: false,
          error: { message: 'School with this name already exists' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    if (subdomain && subdomain !== existingSchool.subdomain) {
      const existingSubdomain = await prisma.school.findFirst({
        where: { 
          subdomain, 
          id: { not: schoolId } 
        }
      });
      
      if (existingSubdomain) {
        res.status(409).json({
          success: false,
          error: { message: 'Subdomain already taken' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    if (schoolCode && schoolCode !== existingSchool.schoolCode) {
      const existingSchoolCode = await prisma.school.findFirst({
        where: { 
          schoolCode, 
          id: { not: schoolId } 
        }
      });
      
      if (existingSchoolCode) {
        res.status(409).json({
          success: false,
          error: { message: 'School code already exists' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Build update data object (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (subdomain !== undefined) updateData.subdomain = subdomain;
    if (address !== undefined) updateData.address = address;
    if (level !== undefined) updateData.level = level;
    if (board !== undefined) updateData.board = board;
    if (schoolCode !== undefined) updateData.schoolCode = schoolCode;
    if (phoneNumbers !== undefined) updateData.phoneNumbers = phoneNumbers;
    if (email !== undefined) updateData.email = email;
    if (principalName !== undefined) updateData.principalName = principalName;
    if (establishedYear !== undefined) updateData.establishedYear = establishedYear;
    if (language !== undefined) updateData.language = language;
    if (metaData !== undefined) updateData.metaData = metaData;

    // Update the school
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: "School updated successfully.",
      data: {
        school: {
          id: updatedSchool.id,
          name: updatedSchool.name,
          subdomain: updatedSchool.subdomain,
          address: updatedSchool.address,
          level: updatedSchool.level,
          board: updatedSchool.board,
          schoolCode: updatedSchool.schoolCode,
          phoneNumbers: updatedSchool.phoneNumbers,
          email: updatedSchool.email,
          principalName: updatedSchool.principalName,
          establishedYear: updatedSchool.establishedYear,
          language: updatedSchool.language,
          metaData: updatedSchool.metaData,
          full_url: `https://${updatedSchool.subdomain}.vidyalayaone.com`,
          isActive: updatedSchool.isActive,
          updated_at: updatedSchool.updatedAt,
        }
      },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update school' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
