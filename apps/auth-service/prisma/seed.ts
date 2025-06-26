import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@onlyexams.com' },
    update: {},
    create: {
      email: 'test@onlyexams.com',
      password: hashedPassword,
      isVerified: true,
    },
  });

  console.log('✅ Test user created:', testUser.email);
  console.log('🌱 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
