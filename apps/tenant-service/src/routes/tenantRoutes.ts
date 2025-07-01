import { Router } from 'express';
import * as tenantController from '../controllers/tenantController';

const router: Router = Router();

// Internal API routes (for API Gateway and other services)
router.get('/internal/by-domain/:domain', tenantController.getTenantByDomain);
router.get('/internal/by-slug/:slug', tenantController.getTenantBySlug);
router.get('/internal/:id', tenantController.getTenantById);

// Public API routes (for platform management)
router.get('/tenants', tenantController.getAllTenants);
router.post('/tenants', tenantController.createTenant);
router.get('/tenants/:id', tenantController.getTenantById);

export default router;

