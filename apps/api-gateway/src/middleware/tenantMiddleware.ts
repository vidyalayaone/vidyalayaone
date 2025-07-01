import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import config from '../config/config';

interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  status: string;
  plan: string;
}

export async function resolveTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const host = req.headers.host || '';
    
    console.log(`🔍 Resolving tenant for host: ${host}`);
    
    // Skip tenant resolution for main platform domain
    if (host === 'onlyexams.com' || host === 'www.onlyexams.com' || host === 'localhost:3000') {
      console.log('📍 Platform domain detected, skipping tenant resolution');
      req.headers['x-context'] = 'platform';
      next();
      return;
    }

    // Extract schoolname from subdomain
    const parts = host.split('.');
    if (parts.length < 3) {
      console.log('❌ Invalid domain format:', host);
      res.status(400).json({
        success: false,
        error: { message: 'Invalid domain format. Expected: schoolname.onlyexams.com' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const schoolname = parts[0]; // Extract first part (schoolname)
    console.log(`🏫 Extracted school name: ${schoolname}`);

    // Call tenant service to get tenant info
    try {
      const tenantServiceUrl = config.services.tenant.url;
      const response = await axios.get(
        `${tenantServiceUrl}/api/v1/internal/by-slug/${schoolname}`,
        { 
          timeout: config.services.tenant.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const tenant: TenantInfo = response.data.data;

      if (!tenant) {
        console.log('❌ Tenant not found for slug:', schoolname);
        res.status(404).json({
          success: false,
          error: { message: `School '${schoolname}' not found` },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (tenant.status !== 'ACTIVE') {
        console.log('❌ Tenant not active:', tenant.status);
        res.status(403).json({
          success: false,
          error: { 
            message: `School '${schoolname}' is not active`,
            status: tenant.status 
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Attach tenant context to request headers
      req.headers['x-context'] = 'school';
      req.headers['x-tenant-id'] = tenant.id;
      req.headers['x-tenant-slug'] = tenant.slug;
      req.headers['x-tenant-name'] = tenant.name;
      req.headers['x-tenant-status'] = tenant.status;
      req.headers['x-tenant-plan'] = tenant.plan;

      console.log(`✅ Tenant resolved: ${tenant.name} (${tenant.slug}) - Plan: ${tenant.plan}`);
      next();
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('❌ Tenant not found for slug:', schoolname);
        res.status(404).json({
          success: false,
          error: { message: `School '${schoolname}' not found` },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      console.error('❌ Tenant service call failed:', error.message);
      res.status(503).json({
        success: false,
        error: { message: 'Tenant service temporarily unavailable' },
        timestamp: new Date().toISOString(),
      });
      return;
    }
  } catch (error) {
    console.error('❌ Tenant resolution middleware error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Tenant resolution failed' },
      timestamp: new Date().toISOString(),
    });
    return;
  }
}
