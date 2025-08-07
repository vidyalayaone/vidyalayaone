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
  cors: {
    origin: string;
  };
  database: {
    url: string;
  };
  authServiceUrl: string;
  authServiceTimeout: number;
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3002', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  authServiceTimeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '30000', 10),
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;
