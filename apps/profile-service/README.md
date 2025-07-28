# Profile Service

The Profile Service handles teacher and student profile management in the vidyalayaone educational platform. It provides comprehensive APIs for creating, managing, and maintaining user profiles with multi-tenant support.

## Features

### Teacher Management
- ✅ Create teacher profiles with auto-generated usernames
- ✅ Update teacher information and assignments
- ✅ Manage subjects and class assignments
- ✅ Password reset functionality
- ✅ Document upload and management
- ✅ Employment type and status tracking

### Student Management
- ✅ Create student profiles with auto-generated usernames
- ✅ Update student information
- ✅ Class and section management
- ✅ Roll number assignment and validation
- ✅ Document upload and management
- ✅ Admission tracking

### Profile Self-Management
- ✅ Teachers/Students can view their own profiles
- ✅ Limited self-editing capabilities (phone, address, profile picture)
- ✅ Document access and viewing

### Security & Authorization
- ✅ Multi-tenant data isolation
- ✅ Role-based access control
- ✅ JWT authentication
- ✅ Admin-only management operations

## API Endpoints

### Teacher Management (`/api/v1/teachers`)
```
POST   /                     - Create teacher (Admin only)
GET    /                     - Get all teachers (Admin only)
GET    /:id                  - Get specific teacher (Admin only)
PUT    /:id                  - Update teacher (Admin only)
DELETE /:id                  - Delete teacher (Admin only)
POST   /:id/reset-password   - Reset teacher password (Admin only)
```

### Student Management (`/api/v1/students`)
```
POST   /                     - Create student (Admin only)
GET    /                     - Get all students (Admin only)
GET    /:id                  - Get specific student (Admin only)
PUT    /:id                  - Update student (Admin only)
DELETE /:id                  - Delete student (Admin only)
POST   /:id/reset-password   - Reset student password (Admin only)
```

### Profile Self-Management (`/api/v1/profile`)
```
GET    /me                   - Get own profile
PATCH  /me                   - Update own profile (limited fields)
```

### Utility Endpoints
```
GET    /api/v1/subjects      - Get available subjects list
GET    /api/v1/classes       - Get available classes (1-12)
```

## Database Schema

### Teacher Model
- Basic info: name, email, phone, username
- Personal: gender, dateOfBirth, address, profilePicture
- Professional: subjects[], classes[], employmentType, joiningDate
- System: status, createdAt, updatedAt, lastLogin
- Relations: documents[]

### Student Model
- Basic info: name, email, phone, username
- Personal: gender, dateOfBirth, address, profilePicture
- Academic: class, section, rollNumber, admissionDate
- System: status, createdAt, updatedAt, lastLogin
- Relations: documents[]

### UserDocument Model
- Document metadata: name, url, type, fileSize, mimeType
- Ownership: userId, userType (TEACHER/STUDENT)
- Timestamps: uploadedAt

## Environment Variables

```bash
# Server Configuration
PORT=3003
NODE_ENV=development
API_PREFIX=/api/v1

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/vidyalayaone_profile"

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key

# Auth Service Integration
AUTH_SERVICE_URL=http://localhost:3001
AUTH_SERVICE_TIMEOUT=30000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
FILE_UPLOAD_BUCKET=your-s3-bucket-name
FILE_UPLOAD_REGION=us-east-1
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd apps/profile-service
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

## Authentication Flow

1. **Admin Creates User**: Admin uses teacher/student creation API
2. **Username Generation**: System auto-generates unique username (firstname.lastname.year)
3. **Auth Service Integration**: Creates user account in auth service
4. **Profile Creation**: Creates detailed profile in profile service
5. **Credentials Sharing**: Returns username and temporary password to admin

## Username Generation Logic

Format: `firstname.lastname.year`
- Example: `john.doe.2024`
- Handles duplicates: `john.doe.2024.1`, `john.doe.2024.2`, etc.
- Tenant-scoped uniqueness

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {} // Optional validation errors
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Multi-Tenant Architecture

- **Tenant Isolation**: All data scoped by `tenantId`
- **Context Resolution**: API Gateway resolves tenant from subdomain
- **Access Control**: Users can only access data within their tenant
- **Admin Permissions**: Platform admins vs. School admins

## Integration with Other Services

### Auth Service
- User account creation
- Password reset functionality
- Token validation

### API Gateway
- Request routing and authentication
- Tenant context resolution
- Rate limiting and security

### File Upload (Future)
- Document storage to S3/Cloud Storage
- Secure URL generation
- File type and size validation

## Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run database migrations
pnpm db:reset         # Reset database
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Prisma Studio

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier
pnpm type-check       # TypeScript type checking
```

## Architecture Decisions

1. **Separate User Management**: Auth service handles authentication, Profile service handles detailed profiles
2. **Username Auto-generation**: Reduces admin burden and ensures consistency
3. **Limited Self-editing**: Teachers/Students can only edit non-critical fields
4. **Document Management**: Prepared for file upload integration
5. **Role-based Access**: Admin-only management, self-service profile updates

## Future Enhancements

- [ ] File upload implementation with cloud storage
- [ ] Bulk import/export functionality
- [ ] Advanced search and filtering
- [ ] Profile picture upload and resizing
- [ ] Email notifications for profile changes
- [ ] Audit trail for profile modifications
- [ ] Advanced reporting and analytics
