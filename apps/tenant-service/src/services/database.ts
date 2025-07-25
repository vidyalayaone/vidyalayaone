// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '../generated/client';
import config from '../config/config';

class DatabaseService {
  private static instance: DatabaseService;
  public prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: config.server.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✅ Tenant Database connected successfully');
    } catch (error) {
      console.error('❌ Tenant Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('✅ Tenant Database disconnected successfully');
    } catch (error) {
      console.error('❌ Tenant Database disconnection failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Tenant Database health check failed:', error);
      return false;
    }
  }
}

export default DatabaseService.getInstance();
