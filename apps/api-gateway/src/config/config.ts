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
    origin: string;
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

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '30000', 10),
    },
    school: {
      url: process.env.SCHOOL_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.SCHOOL_SERVICE_URL || '30000', 10),
    },
    profile: {
      url: process.env.PROFILE_SERVICE_URL || 'http://localhost:3003',
      timeout: parseInt(process.env.PROFILE_SERVICE_TIMEOUT || '30000', 10),
    },
    attendance: {
      url: process.env.ATTENDANCE_SERVICE_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.ATTENDANCE_SERVICE_TIMEOUT || '30000', 10),
    },
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

// Validate required environment variables
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'AUTH_SERVICE_URL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;
