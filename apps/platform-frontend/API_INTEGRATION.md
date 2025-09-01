# API Integration Documentation

## Auth Service API (localhost:3001)

### Register User
```
POST /api/v1/auth/register
Content-Type: application/json
X-Context: platform

Request Body:
{
  "username": "john_doe",
  "phone": "9876543210",
  "password": "password123"
}

Response (Success):
{
  "success": true,
  "message": "Registration successful. Please verify your phone number.",
  "data": { 
    "user_id": "user_123", 
    "phone": "*****43210" 
  },
  "timestamp": "2025-08-27T10:00:00Z"
}

Response (Error):
{
  "success": false,
  "error": { "message": "User already exists" },
  "timestamp": "2025-08-27T10:00:00Z"
}
```

### Verify OTP for Registration
```
POST /api/v1/auth/verify-otp/registration
Content-Type: application/json
X-Context: platform

Request Body:
{
  "username": "john_doe",
  "otp": "123456"
}

Response (Success):
{
  "success": true,
  "message": "User verified successfully.",
  "data": {},
  "timestamp": "2025-08-27T10:00:00Z"
}

Response (Error):
{
  "success": false,
  "error": { "message": "Invalid or expired OTP" },
  "timestamp": "2025-08-27T10:00:00Z"
}
```

### Resend OTP
```
POST /api/v1/auth/resend-otp
Content-Type: application/json
X-Context: platform

Request Body:
{
  "username": "john_doe",
  "purpose": "registration"
}

Response (Success):
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {},
  "timestamp": "2025-08-27T10:00:00Z"
}
```

### Login User
```
POST /api/v1/auth/login
Content-Type: application/json
X-Context: platform

Request Body:
{
  "username": "john_doe",
  "password": "password123"
}

Response (Success):
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token_here",
    "refreshToken": "jwt_refresh_token_here",
    "user": {
      "id": "user_123",
      "roleId": "role_123",
      "roleName": "DEFAULT"
    }
  },
  "timestamp": "2025-08-27T10:00:00Z"
}

Response (Error):
{
  "success": false,
  "error": { "message": "Invalid username or password" },
  "timestamp": "2025-08-27T10:00:00Z"
}
```

## School Service API (localhost:3002)

### Create School
```
POST /api/v1/schools
Content-Type: application/json
Authorization: Bearer jwt_token_here

Request Body:
{
  "name": "ABC Public School",
  "address": "123 School Street, Education District",
  "city": "Mumbai",
  "state": "Maharashtra", 
  "pincode": "400001",
  "phone": "+91 22 1234 5678",
  "email": "info@abcschool.com",
  "website": "https://www.abcschool.com",
  "principalName": "Dr. Jane Smith",
  "principalPhone": "+91 98765 43210",
  "studentStrength": "500",
  "schoolType": "CBSE Affiliated",
  "boards": ["CBSE"],
  "establishedYear": "1995",
  "plan": null,
  "isActive": false
}

Response (Success):
{
  "success": true,
  "data": {
    "school": {
      "id": "school_123",
      "name": "ABC Public School",
      "isActive": false
    }
  }
}

Response (Error):
{
  "success": false,
  "error": "Validation failed",
  "message": "School name is required"
}
```

### Get My School
```
GET /api/v1/schools/my-school
Authorization: Bearer jwt_token_here

Response (Success - School Exists):
{
  "success": true,
  "data": {
    "school": {
      "id": "school_123",
      "name": "ABC Public School",
      "address": "123 School Street, Education District",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "phone": "+91 22 1234 5678",
      "email": "info@abcschool.com",
      "website": "https://www.abcschool.com",
      "principalName": "Dr. Jane Smith",
      "principalPhone": "+91 98765 43210",
      "studentStrength": "500",
      "schoolType": "CBSE Affiliated",
      "boards": ["CBSE"],
      "establishedYear": "1995",
      "isActive": false,
      "plan": "basic",
      "subdomain": "abc-public-school",
      "createdAt": "2025-08-27T10:00:00Z",
      "approvedAt": "2025-08-28T10:00:00Z"
    }
  }
}

Response (No School Found):
{
  "success": false,
  "error": "School not found",
  "message": "No school associated with this user"
}
```

## Payment Service API (localhost:3005)

### Create Order
```
POST /api/v1/payments/create-order
Content-Type: application/json
Authorization: Bearer jwt_token_here

Request Body:
{
  "amount": 1,
  "currency": "INR",
  "schoolId": "school_123"
}

Response (Success):
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "amount": 100,
      "status": "created"
    }
  }
}
```

### Verify Payment
```
POST /api/v1/payments/verify-payment
Content-Type: application/json
Authorization: Bearer jwt_token_here

Request Body:
{
  "razorpay_order_id": "order_123",
  "razorpay_payment_id": "pay_123",
  "razorpay_signature": "signature_hash",
  "schoolId": "school_123"
}

Response (Success):
{
  "success": true,
  "data": {
    "payment": {
      "id": "pay_123",
      "status": "captured",
      "amount": 100
    }
  }
}
```

## User Authentication Flow

1. **Registration**: User provides username, phone, and password
2. **OTP Verification**: System sends OTP to phone, user verifies
3. **Login**: User can login with username/password (only after OTP verification)
4. **School Creation**: After login, user creates school with `isActive: false`
5. **Payment**: User completes payment, school gets `plan: "basic"`
6. **Admin Approval**: Admin changes `isActive: true` (+ subdomain assigned)

## School Status Flow

1. **School Created**: `isActive: false`, `plan: null`
2. **Payment Completed**: `isActive: false`, `plan: "basic"`
3. **Admin Approval**: `isActive: true`, `plan: "basic"` (+ subdomain assigned)

## Frontend Status Display

- `isActive: false` → Show "Pending Approval" 
- `isActive: true` → Show "Active" + subdomain link

## Environment Variables Required

```env
VITE_AUTH_API_URL=http://localhost:3001/api/v1
VITE_SCHOOL_API_URL=http://localhost:3002/api/v1  
VITE_PAYMENT_API_URL=http://localhost:3005/api/v1/payments
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```
