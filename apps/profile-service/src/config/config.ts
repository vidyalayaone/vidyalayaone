import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ 
  path: path.resolve(__dirname, '../../.env')
});

interface ServiceConfig {
  url: string;
  timeout: number;
}

interface Config {
  server: {
    port: number;
    nodeEnv: string;
    apiPrefix: string;
  };
  database: {
    url: string;
  };
  cors: {
    origin: string;
  };
  services: {
    school: ServiceConfig;
    auth: ServiceConfig;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PROFILE_SERVICE_PORT || '3003', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: '/api/v1',
  },
  database: {
    url: process.env.PROFILE_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/profile_db',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  },
  services: {
    school: {
      url: process.env.SCHOOL_SERVICE_URL || 'http://school-service:3002',
      timeout: parseInt(process.env.SCHOOL_SERVICE_TIMEOUT || '30000', 10),
    },
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '30000', 10),
    },
  },
};

export default config;
