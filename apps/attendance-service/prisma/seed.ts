import DatabaseService from '../src/services/database';

const { prisma } = DatabaseService;

async function main() {
  console.log('🌱 Starting attendance service database seeding...');

  // Sample data for testing
  const sampleStudentAttendance = [
    {
      studentId: 'sample-student-id-1',
      schoolId: 'sample-school-id-1',
      attendanceDate: new Date('2025-01-15'),
      status: 'PRESENT' as const,
      attendanceTakerId: 'sample-teacher-id-1',
      metaData: { notes: 'Regular attendance' }
    },
    {
      studentId: 'sample-student-id-2', 
      schoolId: 'sample-school-id-1',
      attendanceDate: new Date('2025-01-15'),
      status: 'ABSENT' as const,
      attendanceTakerId: 'sample-teacher-id-1',
      metaData: { notes: 'Sick leave reported by parent' }
    }
  ];

  const sampleTeacherAttendance = [
    {
      teacherId: 'sample-teacher-id-1',
      schoolId: 'sample-school-id-1', 
      attendanceDate: new Date('2025-01-15'),
      status: 'PRESENT' as const,
      metaData: { checkInTime: '08:30', checkOutTime: '16:30' }
    },
    {
      teacherId: 'sample-teacher-id-2',
      schoolId: 'sample-school-id-1',
      attendanceDate: new Date('2025-01-15'), 
      status: 'HALF_DAY' as const,
      metaData: { checkInTime: '08:30', checkOutTime: '12:30', reason: 'Personal work' }
    }
  ];

  // Create sample student attendance records
  console.log('🧑‍🎓 Creating sample student attendance records...');
  for (const attendance of sampleStudentAttendance) {
    await prisma.studentAttendance.upsert({
      where: {
        studentId_attendanceDate: {
          studentId: attendance.studentId,
          attendanceDate: attendance.attendanceDate
        }
      },
      update: {},
      create: attendance
    });
  }

  // Create sample teacher attendance records
  console.log('👩‍🏫 Creating sample teacher attendance records...');
  for (const attendance of sampleTeacherAttendance) {
    await prisma.teacherAttendance.upsert({
      where: {
        teacherId_attendanceDate: {
          teacherId: attendance.teacherId,
          attendanceDate: attendance.attendanceDate
        }
      },
      update: {},
      create: attendance
    });
  }

  console.log('✅ Attendance service database seeding completed!');
  console.log(`📊 Student attendance records: ${sampleStudentAttendance.length}`);
  console.log(`👩‍🏫 Teacher attendance records: ${sampleTeacherAttendance.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
