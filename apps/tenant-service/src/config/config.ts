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
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;
