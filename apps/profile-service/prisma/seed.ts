import { PrismaClient, Gender, EmploymentType, UserStatus, UserType } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting profile service database seeding...');

  // Sample teachers
  const teacherData = [
    {
      id: 'teacher-1',
      tenantId: 'demo-tenant-id',
      userId: 'auth-user-1',
      name: 'John Smith',
      username: 'john.smith.2024',
      email: 'john.smith@demo-school.com',
      phone: '+1234567890',
      gender: Gender.MALE,
      dateOfBirth: new Date('1985-06-15'),
      address: '123 Teacher Lane, Education City',
      subjects: ['Mathematics', 'Physics'],
      classes: [9, 10, 11, 12],
      joiningDate: new Date('2020-08-01'),
      employmentType: EmploymentType.FULL_TIME,
      status: UserStatus.ACTIVE,
    },
    {
      id: 'teacher-2', 
      tenantId: 'demo-tenant-id',
      userId: 'auth-user-2',
      name: 'Sarah Johnson',
      username: 'sarah.johnson.2024',
      email: 'sarah.johnson@demo-school.com',
      phone: '+1234567891',
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1990-03-22'),
      address: '456 Academic Ave, Knowledge Town',
      subjects: ['English', 'Literature'],
      classes: [6, 7, 8, 9],
      joiningDate: new Date('2021-07-15'),
      employmentType: EmploymentType.FULL_TIME,
      status: UserStatus.ACTIVE,
    }
  ];

  // Sample students
  const studentData = [
    {
      id: 'student-1',
      tenantId: 'demo-tenant-id',
      userId: 'auth-user-3',
      name: 'Alice Wilson',
      username: 'alice.wilson.2024',
      email: 'alice.wilson@demo-school.com',
      phone: '+1234567892',
      gender: Gender.FEMALE,
      dateOfBirth: new Date('2008-09-10'),
      address: '789 Student Street, Learning District',
      class: 10,
      section: 'A',
      rollNumber: 'STU001',
      admissionDate: new Date('2023-04-01'),
      status: UserStatus.ACTIVE,
    },
    {
      id: 'student-2',
      tenantId: 'demo-tenant-id', 
      userId: 'auth-user-4',
      name: 'Bob Brown',
      username: 'bob.brown.2024',
      email: 'bob.brown@demo-school.com',
      phone: '+1234567893',
      gender: Gender.MALE,
      dateOfBirth: new Date('2007-12-05'),
      address: '321 Scholar Road, Academy Heights',
      class: 11,
      section: 'B',
      rollNumber: 'STU002',
      admissionDate: new Date('2022-04-01'),
      status: UserStatus.ACTIVE,
    }
  ];

  // Create teachers
  for (const teacher of teacherData) {
    const createdTeacher = await prisma.teacher.upsert({
      where: { id: teacher.id },
      update: teacher,
      create: teacher,
    });
    console.log(`✅ Created/Updated teacher: ${createdTeacher.name} (${createdTeacher.username})`);
  }

  // Create students
  for (const student of studentData) {
    const createdStudent = await prisma.student.upsert({
      where: { id: student.id },
      update: student,
      create: student,
    });
    console.log(`✅ Created/Updated student: ${createdStudent.name} (${createdStudent.username})`);
  }

  console.log('🌱 Profile service database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Profile service seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
