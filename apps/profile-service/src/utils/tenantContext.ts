import { Request } from 'express';
import { TenantContext } from '../types';

export function getTenantContext(req: Request): TenantContext {
  return {
    context: req.headers['x-context'] as 'platform' | 'school',
    tenantId: req.headers['x-tenant-id'] as string ?? null,
    tenantSlug: req.headers['x-tenant-slug'] as string ?? null,
    tenantName: req.headers['x-tenant-name'] as string ?? null,
  };
}
