import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { getTenantContext } from '../utils/tenantContext';

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const { context } = getTenantContext(req);
    const userRole = req.user?.role;

    if (context === 'platform' && userRole !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { message: 'Admin access required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (context === 'school' && !['ADMIN', 'PRINCIPAL'].includes(userRole || '')) {
      res.status(403).json({
        success: false,
        error: { message: 'Admin or Principal access required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Authorization check failed' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}

export function requireSchoolContext(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const { context, tenantId } = getTenantContext(req);

    if (context !== 'school' || !tenantId) {
      res.status(400).json({
        success: false,
        error: { message: 'School context required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Context validation failed' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
