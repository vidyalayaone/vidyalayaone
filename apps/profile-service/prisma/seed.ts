import DatabaseService from '../src/services/database';

const { prisma } = DatabaseService;

async function main() {
  console.log('🌱 Starting database seeding...');

  // Add sample teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      userId: 'sample-user-id-1',
      schoolId: 'sample-school-id-1',
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'MALE',
      phone: '+1234567890',
      email: 'john.doe@school.com',
      qualification: 'M.Ed in Mathematics',
      experience: 5,
      designation: 'Senior Teacher',
      department: 'Mathematics',
      maritalStatus: 'MARRIED',
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: 'sample-user-id-2',
      schoolId: 'sample-school-id-1',
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      gender: 'FEMALE',
      phone: '+1234567891',
      email: 'jane.smith@school.com',
      qualification: 'M.A in English',
      experience: 8,
      designation: 'Head of Department',
      department: 'English',
      maritalStatus: 'SINGLE',
    },
  });

  // Add sample students
  const student1 = await prisma.student.create({
    data: {
      userId: 'sample-user-id-3',
      schoolId: 'sample-school-id-1',
      admissionNumber: 'ADM2024001',
      rollNumber: '101',
      firstName: 'Alice',
      lastName: 'Johnson',
      gender: 'FEMALE',
      phone: '+1234567892',
      email: 'alice.johnson@student.com',
      class: '10',
      section: 'A',
      academicYear: '2024-25',
      fatherName: 'Robert Johnson',
      motherName: 'Mary Johnson',
      guardianPhone: '+1234567893',
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: 'sample-user-id-4',
      schoolId: 'sample-school-id-1',
      admissionNumber: 'ADM2024002',
      rollNumber: '102',
      firstName: 'Bob',
      lastName: 'Williams',
      gender: 'MALE',
      phone: '+1234567894',
      email: 'bob.williams@student.com',
      class: '10',
      section: 'A',
      academicYear: '2024-25',
      fatherName: 'David Williams',
      motherName: 'Sarah Williams',
      guardianPhone: '+1234567895',
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`Created ${await prisma.teacher.count()} teachers`);
  console.log(`Created ${await prisma.student.count()} students`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
