import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  server: z.object({
    port: z.number().default(3005),
    nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
    apiPrefix: z.string().default('/api/v1'),
  }),
  database: z.object({
    url: z.string().min(1, 'Database URL is required'),
  }),
  razorpay: z.object({
    keyId: z.string().min(1, 'Razorpay Key ID is required'),
    keySecret: z.string().min(1, 'Razorpay Key Secret is required'),
    webhookSecret: z.string().min(1, 'Razorpay Webhook Secret is required'),
  }),
  cors: z.object({
    origin: z.string().default('http://localhost:8080'),
  }),
  services: z.object({
    schoolService: z.object({
      url: z.string().default('http://school-service:3002'),
      timeout: z.number().default(30000),
    }),
  }),
  pdf: z.object({
    storagePath: z.string().default('/app/receipts'),
    company: z.object({
      name: z.string().default('VidyalayaOne'),
      address: z.string().default('Your Company Address Here'),
      email: z.string().default('contact@vidyalayaone.com'),
      phone: z.string().default('+91-9999999999'),
    }),
  }),
  security: z.object({
    webhookRateLimit: z.number().default(100),
    apiRateLimit: z.number().default(100),
  }),
});

const env = {
  server: {
    port: parseInt(process.env.PORT || '3005', 10),
    nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  },
  services: {
    schoolService: {
      url: process.env.SCHOOL_SERVICE_URL || 'http://school-service:3002',
      timeout: parseInt(process.env.SCHOOL_SERVICE_TIMEOUT || '30000', 10),
    },
  },
  pdf: {
    storagePath: process.env.RECEIPT_STORAGE_PATH || '/app/receipts',
    company: {
      name: process.env.COMPANY_NAME || 'VidyalayaOne',
      address: process.env.COMPANY_ADDRESS || 'Your Company Address Here',
      email: process.env.COMPANY_EMAIL || 'contact@vidyalayaone.com',
      phone: process.env.COMPANY_PHONE || '+91-9999999999',
    },
  },
  security: {
    webhookRateLimit: parseInt(process.env.WEBHOOK_RATE_LIMIT || '100', 10),
    apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '100', 10),
  },
};

const config = configSchema.parse(env);

export default config;
