import DatabaseService from '../src/services/database';
import bcrypt from 'bcrypt';
import config from '../src/config/config';
import { Role } from '../src/generated/client';

const { prisma } = DatabaseService;

async function main() {
  console.log('🌱 Starting auth database seeding...');

  // Create an admin user
  const passwordHash = await bcrypt.hash('password123', config.security.bcryptSaltRounds);
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      phone: '6266032577',
      passwordHash: passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
    },
  });

  console.log('✅ Admin user created:', adminUser.username);

  // Create an OTP for the admin user (optional)
  const otp = await prisma.otp.create({
    data: {
      userId: adminUser.id,
      otp: '123456',
      purpose: 'registration',
      isUsed: true,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    },
  });

  console.log('✅ OTP created for admin user:', otp.otp);
  console.log('🌱 Auth database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
