import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ 
  path: path.resolve(__dirname, '../../.env')
});

interface Config {
  server: {
    port: number;
    nodeEnv: string;
    apiPrefix: string;
  };
  database: {
    url: string;
  };
  jwt: {
    accessSecret: string;
  };
  services: {
    auth: {
      url: string;
      timeout: number;
    };
  };
  cors: {
    origin: string;
  };
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
    bucket?: string;
    region?: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3003', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
  },
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '30000', 10),
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(','),
    bucket: process.env.FILE_UPLOAD_BUCKET,
    region: process.env.FILE_UPLOAD_REGION,
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;
