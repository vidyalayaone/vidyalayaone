import { Request, Response } from 'express';
import DatabaseService from "../services/database";
import { extractSubdomainFromDomain } from '../utils/extractSubdomainFromDomain';

const { prisma } = DatabaseService;

export async function getTenantByDomain(req: Request, res: Response): Promise<void> {
  try {
    const { domain } = req.query;

    if (!domain || typeof domain !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Domain parameter is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    let tenant = null;

    const customDomain = await prisma.customDomain.findUnique({
      where: { 
        domain,
        isVerified: true
      },
      include: { tenant: true }
    });

    if (customDomain) {
      tenant = customDomain.tenant;
    } else {
      // Extract subdomain and find by subdomain
      const subdomain = extractSubdomainFromDomain(domain);
      if (subdomain) {
        tenant = await prisma.tenant.findUnique({
          where: { subdomain }
        });
      }
    }

    if (!tenant || !tenant.isActive) {
      res.status(404).json({
        success: false,
        error: { message: 'Domain parameter is required' }, 
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          isActive: tenant.isActive
        }
      },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    console.error('Tenant fetching error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tenant data' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
