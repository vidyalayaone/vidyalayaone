import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Cleaning payment service database...');
  
  try {
    // Delete in reverse dependency order
    await prisma.receiptLog.deleteMany();
    await prisma.paymentWebhook.deleteMany();
    await prisma.schoolPayment.deleteMany();
    
    console.log('✅ Payment service database cleaned successfully');
  } catch (error) {
    console.error('❌ Error cleaning payment service database:', error);
    throw error;
  }
}

cleanDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
