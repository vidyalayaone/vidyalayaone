import { Request, Response } from 'express';
import DatabaseService from "../services/database";

const { prisma } = DatabaseService;

export async function getTenantByDomain(req: Request, res: Response): Promise<void> {
  try {
    const { domain } = req.params;

    if (!domain) {
      res.status(400).json({
        success: false,
        error: { message: 'Domain parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { domain },
      select: { 
        id: true, 
        slug: true, 
        name: true, 
        status: true, 
        plan: true,
        createdAt: true 
      }
    });

    if (!tenant) {
      res.status(404).json({
        success: false,
        error: { message: 'Tenant not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (tenant.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: { 
          message: 'Tenant is not active',
          status: tenant.status 
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tenant,
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Get tenant by domain error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tenant' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}

export async function getTenantBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    if (!slug) {
      res.status(400).json({
        success: false,
        error: { message: 'Slug parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { 
        id: true, 
        slug: true, 
        name: true, 
        status: true, 
        plan: true,
        createdAt: true 
      }
    });

    if (!tenant) {
      res.status(404).json({
        success: false,
        error: { message: 'Tenant not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tenant,
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Get tenant by slug error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tenant' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}

export async function getTenantById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: { message: 'Tenant ID parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: { 
        id: true, 
        slug: true, 
        name: true, 
        status: true, 
        plan: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!tenant) {
      res.status(404).json({
        success: false,
        error: { message: 'Tenant not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tenant,
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Get tenant by ID error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tenant' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}

export async function createTenant(req: Request, res: Response): Promise<void> {
  try {
    const { slug, name, domain, plan = 'FREE' } = req.body;

    if (!slug || !name || !domain) {
      res.status(400).json({
        success: false,
        error: { message: 'Slug, name, and domain are required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if tenant already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug },
          { domain }
        ]
      }
    });

    if (existingTenant) {
      res.status(409).json({
        success: false,
        error: { message: 'Tenant with this slug or domain already exists' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const tenant = await prisma.tenant.create({
      data: {
        slug,
        name,
        domain,
        plan,
        status: 'TRIAL'
      },
      select: { 
        id: true, 
        slug: true, 
        name: true, 
        domain: true,
        status: true, 
        plan: true,
        createdAt: true 
      }
    });

    res.status(201).json({
      success: true,
      data: tenant,
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create tenant' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}

export async function getAllTenants(req: Request, res: Response): Promise<void> {
  try {
    const tenants = await prisma.tenant.findMany({
      select: { 
        id: true, 
        slug: true, 
        name: true, 
        domain: true,
        status: true, 
        plan: true,
        createdAt: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: tenants,
      count: tenants.length,
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Get all tenants error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tenants' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
