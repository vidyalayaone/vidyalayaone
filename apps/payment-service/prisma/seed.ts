import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting payment service database seeding...');
  
  // Create sample data if needed
  console.log('✅ Payment service database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding payment service database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
