import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ 
  path: path.resolve(__dirname, '../../.env')
});

interface ServiceConfig {
  url: string;
  timeout: number;
}

interface ServicesConfig {
  auth: ServiceConfig;
  school: ServiceConfig;
  profile: ServiceConfig;
  attendance: ServiceConfig;
  payment?: ServiceConfig; // optional payment service
  // add more services
}

interface Config {
  server: {
    port: number;
    nodeEnv: string;
    apiPrefix: string;
  };
  services: ServicesConfig;
  jwt: {
    accessSecret: string;
  };
  cors: {
    origin: (string | RegExp)[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  proxy: {
    timeout: number;
    retries: number;
  };
}

const rawCorsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:3000'];

const parsedCorsOrigins = rawCorsOrigins.map(origin => {
  if (origin.includes('*')) {
    // convert *.vidyalayaone.com → regex
    const regex = new RegExp(
      '^' + origin.replace(/\./g, '\\.').replace('*', '([a-z0-9-]+)') + '$'
    );
    return regex;
  }
  return origin; // exact match
});

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '30000', 10),
    },
    school: {
      url: process.env.SCHOOL_SERVICE_URL || 'http://school-service:3002',
      timeout: parseInt(process.env.SCHOOL_SERVICE_TIMEOUT || '30000', 10),
    },
    profile: {
      url: process.env.PROFILE_SERVICE_URL || 'http://profile-service:3003',
      timeout: parseInt(process.env.PROFILE_SERVICE_TIMEOUT || '30000', 10),
    },
    attendance: {
      url: process.env.ATTENDANCE_SERVICE_URL || 'http://attendance-service:3004',
      timeout: parseInt(process.env.ATTENDANCE_SERVICE_TIMEOUT || '30000', 10),
    },
    payment: {
      url: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005',
      timeout: parseInt(process.env.PAYMENT_SERVICE_TIMEOUT || '30000', 10),
    },
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
  },
  cors: {
    origin: parsedCorsOrigins,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  proxy: {
    timeout: parseInt(process.env.PROXY_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.PROXY_RETRIES || '3', 10),
  },
};

export default config;
