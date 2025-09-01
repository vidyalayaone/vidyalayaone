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
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  security: {
    bcryptSaltRounds: number;
    otpExpiresIn: number;
    maxLoginAttempts: number;
    lockoutTime: number;
  };
  cors: {
    origin: string | string[];
  };
  sms: {
    fast2smsApiKey: string,
    testNumbers: string
  };
  services: {
    school: {
      url: string;
      timeout: number;
    };
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || '',
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    otpExpiresIn: parseInt(process.env.OTP_EXPIRES_IN || '10', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutTime: parseInt(process.env.LOCKOUT_TIME || '15', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  },
  sms: {
    fast2smsApiKey: process.env.FAST2SMS_API_KEY || '',
    testNumbers: process.env.SMS_TEST_NUMBERS || '',
  },
  services: {
    school: {
      url: process.env.SCHOOL_SERVICE_URL || 'http://school-service:3002',
      timeout: parseInt(process.env.SCHOOL_SERVICE_TIMEOUT || '30000', 10),
    },
  }
};

export default config;
