import { Request } from 'express';

export function getTenantContext(req: Request) {
  return {
    context: req.headers['x-context'] as 'platform' | 'school',
    tenantId: req.headers['x-tenant-id'] as string ?? null,
    tenantSlug: req.headers['x-tenant-slug'] as string ?? null,
  };
}
