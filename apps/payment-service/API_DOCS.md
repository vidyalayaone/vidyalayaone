# Payment Service API Documentation

## Base URL
```
http://localhost:3005/api/v1/payments
```

## Authentication
All endpoints require proper authentication headers (to be implemented based on your auth system).

## Endpoints

### 1. Create Payment Order

**POST** `/orders`

Create a new payment order for school registration.

#### Request Body
```json
{
  "schoolId": "uuid-string",
  "amount": 500.00,
  "notes": {
    "purpose": "school_registration",
    "additionalInfo": "any additional data"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_xyz123",
      "amount": 50000,
      "currency": "INR",
      "receipt": "RCP_1234567890_abc123",
      "status": "created",
      "created_at": 1640995200,
      "notes": {
        "schoolId": "uuid-string",
        "purpose": "school_registration"
      }
    },
    "payment": {
      "id": "uuid-payment-id",
      "schoolId": "uuid-string",
      "razorpayOrderId": "order_xyz123",
      "amount": 50000,
      "currency": "INR",
      "status": "CREATED",
      "receipt": "RCP_1234567890_abc123",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Payment order created successfully"
}
```

### 2. Verify Payment

**POST** `/verify`

Verify payment after successful completion on Razorpay.

#### Request Body
```json
{
  "razorpayOrderId": "order_xyz123",
  "razorpayPaymentId": "pay_abc456",
  "razorpaySignature": "signature_hash_string"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid-payment-id",
      "schoolId": "uuid-string",
      "razorpayOrderId": "order_xyz123",
      "razorpayPaymentId": "pay_abc456",
      "amount": 50000,
      "currency": "INR",
      "status": "PAID",
      "paymentMethod": "card",
      "paidAt": "2024-01-01T00:05:00.000Z"
    },
    "receipt": {
      "id": "uuid-receipt-id",
      "receiptNumber": "RCP_12345678_xyz",
      "filePath": "/app/receipts/RCP_12345678_xyz.pdf",
      "downloadUrl": "/api/v1/payments/receipts/uuid-receipt-id/download"
    }
  },
  "message": "Payment verified successfully"
}
```

### 3. Get Payment Status

**GET** `/orders/{orderId}/status`

Get the current status of a payment order.

#### Response
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid-payment-id",
      "schoolId": "uuid-string",
      "razorpayOrderId": "order_xyz123",
      "razorpayPaymentId": "pay_abc456",
      "amount": 50000,
      "currency": "INR",
      "status": "PAID",
      "paymentMethod": "card",
      "attempts": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "paidAt": "2024-01-01T00:05:00.000Z"
    },
    "receipts": [
      {
        "id": "uuid-receipt-id",
        "receiptNumber": "RCP_12345678_xyz",
        "receiptType": "PAYMENT_RECEIPT",
        "generatedAt": "2024-01-01T00:05:30.000Z",
        "downloadUrl": "/api/v1/payments/receipts/uuid-receipt-id/download"
      }
    ]
  }
}
```

### 4. Get School Payments

**GET** `/schools/{schoolId}/payments`

Get all payments for a specific school.

#### Query Parameters
- `status` (optional): Filter by payment status (CREATED, PAID, FAILED, etc.)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

#### Response
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid-payment-id",
        "razorpayOrderId": "order_xyz123",
        "razorpayPaymentId": "pay_abc456",
        "amount": 50000,
        "currency": "INR",
        "status": "PAID",
        "paymentMethod": "card",
        "receipt": "RCP_12345678_xyz",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "paidAt": "2024-01-01T00:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 5. Create Refund

**POST** `/refunds`

Create a refund for a payment.

#### Request Body
```json
{
  "paymentId": "uuid-payment-id",
  "amount": 250.00,
  "notes": {
    "reason": "Cancellation requested by school"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "refund": {
      "id": "rfnd_xyz789",
      "payment_id": "pay_abc456",
      "amount": 25000,
      "currency": "INR",
      "status": "processed",
      "created_at": 1640995800
    },
    "payment": {
      "id": "uuid-payment-id",
      "status": "PARTIAL_REFUND",
      "updatedAt": "2024-01-01T00:10:00.000Z"
    },
    "receipt": {
      "id": "uuid-refund-receipt-id",
      "receiptNumber": "REF_12345678_xyz",
      "downloadUrl": "/api/v1/payments/receipts/uuid-refund-receipt-id/download"
    }
  },
  "message": "Refund created successfully"
}
```

### 6. Get Payment Statistics

**GET** `/stats`

Get payment statistics and analytics.

#### Query Parameters
- `schoolId` (optional): Filter stats for specific school

#### Response
```json
{
  "success": true,
  "data": {
    "totalPayments": 100,
    "successfulPayments": 95,
    "failedPayments": 5,
    "totalAmount": 50000.00,
    "successfulAmount": 47500.00,
    "successRate": 95.00,
    "averageAmount": 500.00,
    "paymentMethods": {
      "card": 60,
      "upi": 25,
      "netbanking": 10
    }
  }
}
```

### 7. Download Receipt

**GET** `/receipts/{receiptId}/download`

Download receipt PDF file.

#### Response
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="receipt-number.pdf"`
- Binary PDF data

### 8. Webhook Endpoint

**POST** `/webhook`

Razorpay webhook endpoint for payment events.

#### Headers
- `x-razorpay-signature`: Webhook signature for verification

#### Request Body
```json
{
  "account_id": "acc_xyz",
  "contains": ["payment"],
  "created_at": 1640995200,
  "entity": "event",
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_abc456",
        "order_id": "order_xyz123",
        "amount": 50000,
        "currency": "INR",
        "status": "captured",
        "method": "card"
      }
    }
  }
}
```

#### Response
```json
{
  "status": "ok"
}
```

## Error Responses

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `PAYMENT_NOT_FOUND`: Payment record not found
- `INVALID_SIGNATURE`: Payment/webhook signature verification failed
- `ORDER_CREATION_FAILED`: Failed to create Razorpay order
- `VERIFICATION_FAILED`: Payment verification failed
- `REFUND_FAILED`: Refund creation failed
- `RECEIPT_NOT_FOUND`: Receipt not found

## Payment Statuses

- `CREATED`: Order created but payment not initiated
- `ATTEMPTED`: Payment initiated by user
- `PAID`: Payment successful and verified
- `FAILED`: Payment failed
- `CANCELLED`: Payment cancelled by user
- `REFUNDED`: Full refund processed
- `PARTIAL_REFUND`: Partial refund processed

## Receipt Types

- `PAYMENT_RECEIPT`: Receipt for successful payment
- `REFUND_RECEIPT`: Receipt for refund transaction
- `CANCELLATION_RECEIPT`: Receipt for cancelled payment

## Rate Limits

- API endpoints: 100 requests per 15 minutes per IP
- Webhook endpoint: 100 requests per 15 minutes per IP

## Testing

Use Razorpay test mode for development:

### Test Cards
- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI IDs
- `success@razorpay`: Successful payment
- `failure@razorpay`: Failed payment

### Test Amounts
- Any amount works in test mode
- Use amounts ending in specific digits to simulate different scenarios
