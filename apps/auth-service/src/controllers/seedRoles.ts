import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { getSchoolContext, getUser, validateInput } from '@vidyalayaone/common-utils';
import { PERMISSIONS, hasPermission } from '@vidyalayaone/common-utils';
import { seedRolesSchema } from '../validations/validationSchemas';
import config from '../config/config';
import axios from 'axios';

const { prisma } = DatabaseService;

// Get all valid permissions from the PERMISSIONS object
function getAllValidPermissions(): string[] {
  const allPermissions: string[] = [];
  
  function flattenPermissions(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        allPermissions.push(obj[key]);
      } else if (typeof obj[key] === 'object') {
        flattenPermissions(obj[key]);
      }
    }
  }
  
  flattenPermissions(PERMISSIONS);
  return allPermissions;
}

export async function seedRoles(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateInput(seedRolesSchema, req.body, res);
    if (!validation.success) return;

    const { schoolId, roles } = validation.data;
    const { context } = getSchoolContext(req);
    const userData = getUser(req);

    // Only allow platform context for seeding roles
    if (context !== 'platform') {
      res.status(400).json({
        success: false,
        error: { message: 'Role seeding can only be done in platform context' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if user has permission to seed roles
    const hasRoleSeedPermission = await hasPermission(PERMISSIONS.SCHOOL.SEED_ROLES, userData);
    if (!hasRoleSeedPermission) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to seed roles' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify the school exists by calling the school service
    try {
      const schoolResponse = await axios.get(
        `${config.services.school.url}/api/v1/school/get-by-id/${schoolId}`,
        {
          timeout: config.services.school.timeout,
          headers: {
            'x-user-id': userData?.id,
            'x-user-role-id': userData?.roleId,
            'x-user-role-name': userData?.roleName,
            'x-user-permissions': JSON.stringify(userData?.permissions || []),
            'x-school-context': 'platform'
          }
        }
      );

      if (!schoolResponse.data || !schoolResponse.data.success) {
        res.status(404).json({
          success: false,
          error: { message: 'School not found' },
          timestamp: new Date().toISOString()
        });
        return;
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        res.status(404).json({
          success: false,
          error: { message: 'School not found' },
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      console.error('Error verifying school existence:', error.message);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to verify school existence' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get all valid permissions for validation
    const validPermissions = getAllValidPermissions();

    // Validate that all provided permissions are valid
    for (const role of roles) {
      for (const permission of role.permissions) {
        if (!validPermissions.includes(permission)) {
          res.status(400).json({
            success: false,
            error: { 
              message: `Invalid permission: ${permission}. Valid permissions are: ${validPermissions.join(', ')}` 
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
      }
    }

    // Create roles in the database
    const createdRoles = [];
    
    for (const roleData of roles) {
      // Check if role with the same name already exists for this school
      const existingRole = await prisma.role.findFirst({
        where: {
          name: roleData.name,
          schoolId: schoolId
        }
      });

      if (existingRole) {
        res.status(409).json({
          success: false,
          error: { message: `Role with name "${roleData.name}" already exists for this school` },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Create the role
      const newRole = await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description || null,
          permissions: roleData.permissions,
          schoolId: schoolId
        }
      });

      createdRoles.push(newRole);
    }

    res.status(201).json({
      success: true,
      data: {
        message: `Successfully created ${createdRoles.length} role(s) for school`,
        schoolId: schoolId,
        roles: createdRoles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          createdAt: role.createdAt
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Seed roles error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to seed roles' },
      timestamp: new Date().toISOString()
    });
  }
}
