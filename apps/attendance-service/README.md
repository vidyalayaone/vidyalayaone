# Attendance Service

The Attendance Service manages student and teacher attendance tracking for the VidyalayaOne school management system.

## Features

- **Student Attendance Management**
  - Mark daily attendance (Present, Absent, Leave)
  - Unique attendance per student per date
  - Track attendance taker (teacher) information
  - Store metadata (notes, reasons, etc.)

- **Teacher Attendance Management**
  - Mark daily attendance (Present, Absent, Leave, Half Day)
  - Unique attendance per teacher per date
  - Store metadata (check-in/out times, reasons, etc.)

- **Reporting & Analytics**
  - Attendance summaries and statistics
  - Date range filtering
  - Pagination support
  - Bulk operations

## Database Schema

### StudentAttendance
- `id`: UUID (primary key)
- `studentId`: Reference to Student.id (profile-service)
- `schoolId`: Reference to School.id (school-service)
- `attendanceDate`: Date (unique per student)
- `status`: Enum (PRESENT, ABSENT, LEAVE)
- `attendanceTakerId`: Reference to Teacher.id (profile-service)
- `metaData`: JSON (flexible additional data)
- `createdAt`, `updatedAt`: Timestamps

### TeacherAttendance
- `id`: UUID (primary key)
- `teacherId`: Reference to Teacher.id (profile-service)
- `schoolId`: Reference to School.id (school-service)
- `attendanceDate`: Date (unique per teacher)
- `status`: Enum (PRESENT, ABSENT, LEAVE, HALF_DAY)
- `metaData`: JSON (flexible additional data)
- `createdAt`, `updatedAt`: Timestamps

## Development

### Prerequisites
- Node.js 22+
- pnpm 10.12.1+
- PostgreSQL 16+

### Setup
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start development server
pnpm dev

# View database in Prisma Studio
pnpm db:studio
```

### Available Scripts
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:clean` - Clean database (delete all records)
- `pnpm db:studio` - Open Prisma Studio on port 5559

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3004)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - CORS origin URL
- `SCHOOL_SERVICE_URL` - School service URL
- `AUTH_SERVICE_URL` - Auth service URL
- `PROFILE_SERVICE_URL` - Profile service URL

## API Endpoints (Future)

The attendance service will provide RESTful APIs for:

### Student Attendance
- `POST /api/v1/attendance/students` - Mark student attendance
- `GET /api/v1/attendance/students` - Get student attendance records
- `PUT /api/v1/attendance/students/:id` - Update attendance record
- `DELETE /api/v1/attendance/students/:id` - Delete attendance record
- `POST /api/v1/attendance/students/bulk` - Bulk attendance marking

### Teacher Attendance
- `POST /api/v1/attendance/teachers` - Mark teacher attendance
- `GET /api/v1/attendance/teachers` - Get teacher attendance records
- `PUT /api/v1/attendance/teachers/:id` - Update attendance record
- `DELETE /api/v1/attendance/teachers/:id` - Delete attendance record
- `POST /api/v1/attendance/teachers/bulk` - Bulk attendance marking

### Reports & Analytics
- `GET /api/v1/attendance/reports/students/summary` - Student attendance summary
- `GET /api/v1/attendance/reports/teachers/summary` - Teacher attendance summary
- `GET /api/v1/attendance/reports/daily` - Daily attendance report
- `GET /api/v1/attendance/reports/monthly` - Monthly attendance report

## Docker

The service runs in a Docker container with the following configuration:
- Port: 3004
- Prisma Studio: 5559
- Database: PostgreSQL (attendance_db)

## Dependencies

### Production
- Express.js - Web framework
- Prisma - Database ORM
- Zod - Schema validation
- Helmet - Security middleware
- CORS - Cross-origin resource sharing
- Morgan - HTTP request logger

### Development
- TypeScript - Type safety
- ts-node-dev - Development server
- ESLint - Code linting
- Prettier - Code formatting

## Related Services

- **Auth Service** - User authentication and authorization
- **School Service** - School, class, and section management
- **Profile Service** - Student and teacher profile management
- **API Gateway** - Request routing and middleware

## Notes

- Attendance records are unique per student/teacher per date
- The service references external entities but doesn't duplicate data
- Metadata field allows flexible storage of additional information
- Built following the same patterns as other services in the system
