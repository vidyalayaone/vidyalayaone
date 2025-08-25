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

// Determine the environment and appropriate service URLs
const getSchoolServiceUrl = (): string => {
  // If SCHOOL_SERVICE_URL is explicitly set, use it
  if (process.env.SCHOOL_SERVICE_URL) {
    return process.env.SCHOOL_SERVICE_URL;
  }
  
  // Check if running in Docker environment
  // In Docker, hostname is usually the container ID, not localhost
  const isDockerEnvironment = process.env.DATABASE_URL?.includes('@postgres:') || 
                             process.env.HOSTNAME !== 'localhost';
  
  return isDockerEnvironment ? 'http://school-service:3002' : 'http://localhost:3002';
};

const getAuthServiceUrl = (): string => {
  // If AUTH_SERVICE_URL is explicitly set, use it
  if (process.env.AUTH_SERVICE_URL) {
    return process.env.AUTH_SERVICE_URL;
  }
  
  // Check if running in Docker environment
  const isDockerEnvironment = process.env.DATABASE_URL?.includes('@postgres:') || 
                             process.env.HOSTNAME !== 'localhost';
  
  return isDockerEnvironment ? 'http://auth-service:3001' : 'http://localhost:3001';
};

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
      url: getSchoolServiceUrl(),
      timeout: parseInt(process.env.SCHOOL_SERVICE_TIMEOUT || '30000', 10),
    },
    auth: {
      url: getAuthServiceUrl(),
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '30000', 10),
    },
  },
};

export default config;
