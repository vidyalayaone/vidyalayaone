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
      phoneVerifiedAt: new Date(),
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
      phoneVerifiedAt: new Date(),
      roleId: platformRoleFinal.id,
      schoolId: PLATFORM_SCHOOL_ID,
    },
  });

  console.log('✅ Created or updated user:', user.username);
  console.log(`   • role assigned: PLATFORM_ADMIN (roleId=${platformRoleFinal.id})`);
  console.log('   • credentials -> username:', username, 'password: password123');

  // --- New: create DEFAULT role with important admin permissions (excluding platform admin) ---
  const defaultRoleName = 'DEFAULT';
  let defaultRole = await prisma.role.findFirst({ where: { name: defaultRoleName, schoolId: PLATFORM_SCHOOL_ID } });

  // Define important admin permissions (excluding platform-level permissions)
  const defaultAdminPermissions = [
    // Essential permissions
    'platform.login',
    'platform.get_me',
    'school.create',
    
    // Dashboard access
    'dashboard.view_admin',
    
    // Student management
    'student.create',
    'student.update',
    'student.delete',
    'student.view',
    'student.view_details',
    'student.manage_enrollment',
    
    // Teacher management  
    'teacher.create',
    'teacher.update',
    'teacher.delete',
    'teacher.view',
    'teacher.view_details',
    'teacher.assign_class',
    'teacher.manage_schedule',
    
    // Class management
    'class.view',
    'class.update',
    'class.delete',
    'class.manage_sections',
    'class.view_timetable',
    'class.manage_timetable',
    
    // Subject management
    'subject.view',
    'subject.create',
    'subject.update',
    'subject.delete',
    'subject.assign_teacher',
    
    // Attendance management
    'attendance.view',
    'attendance.mark',
    'attendance.edit',
    'attendance.view_reports',
    
    // Exam management
    'exam.create',
    'exam.update',
    'exam.delete',
    'exam.schedule',
    'exam.view',
    'exam.grade',
    'exam.view_results',
    
    // Academic calendar
    'academic_calendar.view',
    'academic_calendar.create',
    'academic_calendar.update',
    'academic_calendar.delete',
    
    // Admissions
    'admission.view',
    'admission.create',
    'admission.update',
    'admission.delete',
    'admission.approve',
    'admission.reject',
    'admission.bulk_import',
    
    // Fee management
    'fee.view',
    'fee.create',
    'fee.update',
    'fee.delete',
    'fee.collect',
    'fee.view_reports',
    
    // Communication
    'communication.send_announcement',
    'communication.send_message',
    'communication.view_messages',
    'communication.manage_notifications',
    
    // Substitute teacher management
    'substitute_teacher.view',
    'substitute_teacher.assign',
    'substitute_teacher.manage',
    
    // Reports (admin level)
    'report.view_admin',
    'report.generate',
    'report.export',
    
    // School management (but not platform-level school operations)
    'school.get',
    'school.view',
    'school.update',
    'school.manage_settings',
    'school.view_analytics'
  ];

  if (!defaultRole) {
    defaultRole = await prisma.role.create({
      data: {
        name: defaultRoleName,
        description: 'Default role with comprehensive school administration permissions',
        permissions: defaultAdminPermissions,
        schoolId: PLATFORM_SCHOOL_ID,
      },
    });
    console.log('✅ Created role DEFAULT with comprehensive admin permissions');
  } else {
    // Update existing role with new permissions
    await prisma.role.update({ 
      where: { id: defaultRole.id }, 
      data: { 
        permissions: defaultAdminPermissions,
        description: 'Default role with comprehensive school administration permissions'
      } 
    });
    defaultRole = await prisma.role.findUnique({ where: { id: defaultRole.id } }) as any;
    console.log('✅ Updated DEFAULT role with comprehensive admin permissions');
  }

  // Re-fetch DEFAULT role to ensure non-null
  const defaultRoleFinal = await prisma.role.findFirst({ where: { name: defaultRoleName, schoolId: PLATFORM_SCHOOL_ID } });
  if (!defaultRoleFinal) throw new Error('Failed to create or find DEFAULT role');
  
  // --- Create a sample user assigned to DEFAULT role (mirrors register flow) ---
  const defaultUsername = 'first_user';
  const defaultRawPassword = 'password123';
  const defaultPasswordHash = await bcrypt.hash(defaultRawPassword, config.security.bcryptSaltRounds);

  const defaultUser = await prisma.user.upsert({
    where: { username: defaultUsername },
    update: {
      passwordHash: defaultPasswordHash,
      phone: '1111111111',
      isActive: true,
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
      roleId: defaultRoleFinal.id,
      updatedAt: new Date(),
    },
    create: {
      username: defaultUsername,
      phone: '1111111111',
      passwordHash: defaultPasswordHash,
      isActive: true,
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
      roleId: defaultRoleFinal.id,
    },
  });

  console.log('✅ Created or updated default user:', defaultUser.username);
  console.log(`   • role assigned: DEFAULT (roleId=${defaultRoleFinal.id})`);
  console.log('   • credentials -> username:', defaultUsername, 'password:', defaultRawPassword);
  
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
