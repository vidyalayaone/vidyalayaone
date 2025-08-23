import DatabaseService from '../src/services/database';
import bcrypt from 'bcrypt';
import config from '../src/config/config';
import { PERMISSIONS } from '@vidyalayaone/common-utils';

const { prisma } = DatabaseService;

async function main() {
  console.log('🌱 Starting auth database seeding...');

  // Flatten all permission strings from the shared PERMISSIONS object
  const allPermissions: string[] = Object.values(PERMISSIONS as any).flatMap((group: any) => Object.values(group));

  // Create or update PLATFORM_ADMIN role (use a platform-scoped schoolId)
  const PLATFORM_SCHOOL_ID = 'platform';

  let platformRole = await prisma.role.findFirst({ where: { name: 'PLATFORM_ADMIN', schoolId: PLATFORM_SCHOOL_ID } });

  if (!platformRole) {
    await prisma.role.create({
      data: {
        name: 'PLATFORM_ADMIN',
        description: 'Platform administrator with all permissions',
        permissions: allPermissions,
        schoolId: PLATFORM_SCHOOL_ID,
      },
    });
    console.log('✅ Created role PLATFORM_ADMIN');
  } else {
    // Ensure permissions are up-to-date
    await prisma.role.update({ where: { id: platformRole.id }, data: { permissions: allPermissions } });
    console.log('✅ Ensured PLATFORM_ADMIN role exists and permissions updated');
  }

  // Re-fetch to guarantee we have a non-null role object (fixes TS nullability)
  const platformRoleFinal = await prisma.role.findFirst({ where: { name: 'PLATFORM_ADMIN', schoolId: PLATFORM_SCHOOL_ID } });
  if (!platformRoleFinal) throw new Error('Failed to create or find PLATFORM_ADMIN role');

  // Create / update the platform user and attach the PLATFORM_ADMIN role
  const username = 'abhijeetst22';
  const rawPassword = 'password123';
  const passwordHash = await bcrypt.hash(rawPassword, config.security.bcryptSaltRounds);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      phoneVerifiedAt: new Date(),
      emailVerifiedAt: new Date(),
      roleId: platformRoleFinal.id,
      schoolId: PLATFORM_SCHOOL_ID,
      updatedAt: new Date(),
    },
    create: {
      username,
      phone: '0000000000',
      passwordHash,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      phoneVerifiedAt: new Date(),
      emailVerifiedAt: new Date(),
      roleId: platformRoleFinal.id,
      schoolId: PLATFORM_SCHOOL_ID,
    },
  });

  console.log('✅ Created or updated user:', user.username);
  console.log(`   • role assigned: PLATFORM_ADMIN (roleId=${platformRoleFinal.id})`);
  console.log('   • credentials -> username:', username, 'password: password123');

  // --- New: create DEFAULT role with only school.create permission ---
  const defaultRoleName = 'DEFAULT';
  const schoolCreatePermission = 'school.create';
  let defaultRole = await prisma.role.findFirst({ where: { name: defaultRoleName, schoolId: PLATFORM_SCHOOL_ID } });

  if (!defaultRole) {
    defaultRole = await prisma.role.create({
      data: {
        name: defaultRoleName,
        description: 'Default role with minimal school create permission',
        permissions: [schoolCreatePermission],
        schoolId: PLATFORM_SCHOOL_ID,
      },
    });
    console.log('✅ Created role DEFAULT with school.create permission');
  } else {
    // Ensure it has only the school.create permission
    await prisma.role.update({ where: { id: defaultRole.id }, data: { permissions: [schoolCreatePermission] } });
    defaultRole = await prisma.role.findUnique({ where: { id: defaultRole.id } }) as any;
    console.log('✅ Ensured DEFAULT role exists and permissions set to school.create');
  }

  // Re-fetch DEFAULT role to ensure non-null
  const defaultRoleFinal = await prisma.role.findFirst({ where: { name: defaultRoleName, schoolId: PLATFORM_SCHOOL_ID } });
  if (!defaultRoleFinal) throw new Error('Failed to create or find DEFAULT role');
  
  console.log('🌱 Auth database seeding (platform role + default role) completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
