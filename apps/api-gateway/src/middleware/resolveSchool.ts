import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import config from '../config/config';

export async function resolveSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const host = req.headers.host || '';
    const path = req.path || '';
    const nodeEnv = config.server.nodeEnv || '';

    console.log(`🔍 Resolving school for host: ${host}, path: ${path}, env: ${nodeEnv}`);

    // Skip school resolution for webhook endpoints
    if (path.includes('/webhook')) {
      console.log('🔗 Webhook endpoint detected, skipping school resolution');
      req.headers['x-context'] = 'webhook';
      next();
      return;
    }

    if(nodeEnv === 'production'){
      // Skip school resolution for main platform domain
    if (host === 'vidyalayaone.com' || host === 'www.vidyalayaone.com') {
      console.log('📍 Platform domain detected, skipping school resolution');
      req.headers['x-context'] = 'platform';
      next();
      return;
    }

    const subdomain = host.split('.')[0];

    req.headers['x-context'] = 'school';
    req.headers['x-subdomain'] = subdomain;
    
    // Fetch school ID from school service
    try {
      console.log(`🔍 Fetching school ID for subdomain: ${subdomain}`);
      const schoolResponse = await axios.get(
        `${config.services.school.url}/api/v1/school/get-by-subdomain/${subdomain}`,
        {
          timeout: config.services.school.timeout,
        }
      );

      if (schoolResponse.data.success && schoolResponse.data.data.school.id) {
        const schoolId = schoolResponse.data.data.school.id;
        req.headers['x-school-id'] = schoolId;
        console.log(`✅ School resolved: ${subdomain} (ID: ${schoolId})`);
      } else {
        console.log('❌ School not found or inactive:', subdomain);
        res.status(404).json({
          success: false,
          error: { message: 'School not found or inactive' },
          timestamp: new Date().toISOString(),
        });
        return;
      }
    } catch (schoolError) {
      console.error('❌ Failed to fetch school information:', schoolError);
      res.status(502).json({
        success: false,
        error: { message: 'Failed to resolve school information' },
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    next();
    }
    else{
      const context = req.headers['x-context'] as string | undefined;

      // If no explicit context provided → assume platform request
      if (!context || context === 'platform') {
        console.log('💻 Dev mode: platform request detected');
        req.headers['x-context'] = 'platform';
        next();
        return
      }

    const subdomain = req.headers['x-subdomain'] as string | undefined;

    if (!subdomain) {
          console.warn('⚠️ Dev mode: school context missing subdomain header');
          res.status(400).json({
            success: false,
            error: { message: 'Missing x-subdomain header in development mode' },
            timestamp: new Date().toISOString(),
          });
          return;
        }
    
    req.headers['x-context'] = 'school';
    req.headers['x-subdomain'] = subdomain;
    
    // Fetch school ID from school service
    try {
      console.log(`🔍 Fetching school ID for subdomain: ${subdomain}`);
      const schoolResponse = await axios.get(
        `${config.services.school.url}/api/v1/school/get-by-subdomain/${subdomain}`,
        {
          timeout: config.services.school.timeout,
        }
      );

      if (schoolResponse.data.success && schoolResponse.data.data.school.id) {
        const schoolId = schoolResponse.data.data.school.id;
        req.headers['x-school-id'] = schoolId;
        console.log(`✅ School resolved: ${subdomain} (ID: ${schoolId})`);
      } else {
        console.log('❌ School not found or inactive:', subdomain);
        res.status(404).json({
          success: false,
          error: { message: 'School not found or inactive' },
          timestamp: new Date().toISOString(),
        });
        return;
      }
    } catch (schoolError) {
      console.error('❌ Failed to fetch school information:', schoolError);
      res.status(502).json({
        success: false,
        error: { message: 'Failed to resolve school information' },
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    next();
    }
    
    
  } catch (error) {
    console.error('❌ School resolution middleware error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'School resolution failed' },
      timestamp: new Date().toISOString(),
    });
    return;
  }
}