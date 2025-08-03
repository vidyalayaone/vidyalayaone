import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import config from '../config/config';

interface schoolInfo {
  id: string;
  isActive: string;
}

export async function resolveSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const host = req.headers.host || '';
    
    console.log(`🔍 Resolving school for host: ${host}`);
    
    // Skip school resolution for main platform domain
    if (host === 'vidyalayaone.com' || host === 'www.vidyalayaone.com' || host === 'localhost:3000') {
      console.log('📍 Platform domain detected, skipping school resolution');
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
        error: { message: 'Invalid domain format. Expected: school_subdomain.vidyalayaone.com' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const subdomain = parts[0];

    req.headers['x-context'] = 'school';
    req.headers['x-school-subdomain'] = subdomain;
    
    console.log(`✅ School resolved: ${subdomain}`);
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
