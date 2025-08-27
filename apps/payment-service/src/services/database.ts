import { PrismaClient } from '../generated/client';

class DatabaseService {
  private static instance: PrismaClient;

  static async connect(): Promise<PrismaClient> {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
      });

      try {
        await this.instance.$connect();
        console.log('✅ Connected to payment database');
      } catch (error) {
        console.error('❌ Failed to connect to payment database:', error);
        throw error;
      }
    }

    return this.instance;
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect();
      console.log('✅ Disconnected from payment database');
    }
  }

  static getInstance(): PrismaClient {
    if (!this.instance) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.instance;
  }

  static async healthCheck(): Promise<boolean> {
    try {
      await this.instance.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

export default DatabaseService;
