import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import config from '../config/config';

interface SchoolInfo {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
}

export async function resolveSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const host = req.headers.host || '';
    
    console.log(`🔍 Resolving school for host: ${host}`);
    
    // Skip school resolution for main platform domain
    if (host === 'vidyalayaone.com' || host === 'www.vidyalayaone.com' || host === 'localhost:8081' || host === 'localhost:3000') {
      console.log('📍 Platform domain detected, skipping school resolution');
      req.headers['x-context'] = 'platform';
      next();
      return;
    }

    let parts: string[];

    // Extract schoolname from subdomain
    if (host.indexOf('.') === -1) {
      parts = host.split(':');
    }
    else {
      parts = host.split('.');
    }
    // if (parts.length < 3) {
    //   console.log('❌ Invalid domain format:', host);
    //   res.status(400).json({
    //     success: false,
    //     error: { message: 'Invalid domain format. Expected: school_subdomain.vidyalayaone.com' },
    //     timestamp: new Date().toISOString(),
    //   });
    //   return;
    // }

    const subdomain = parts[0];

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
