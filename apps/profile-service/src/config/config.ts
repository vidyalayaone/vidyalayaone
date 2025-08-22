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
  cors: {
    origin: string;
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
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
};

export default config;
