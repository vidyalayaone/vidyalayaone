# Payment Service

A comprehensive payment service for handling school registration payments using Ra### 5. Start Development Server
```bash
pnpm dev
```

### 5. Test the Service
Visit `http://localhost:3005/health` to verify the service is running.integration.

## Features

- 🏦 **Razorpay Integration**: Complete integration with Razorpay Payment Gateway
- 💳 **Multiple Payment Methods**: Support for cards, UPI, net banking, wallets, etc.
- 📄 **Receipt Generation**: Automatic PDF receipt generation for payments and refunds
- 🔒 **Webhook Security**: Secure webhook handling with signature verification
- 📊 **Payment Analytics**: Comprehensive payment statistics and reporting
- 🛡️ **Security**: Rate limiting, input validation, and secure error handling
- 🗄️ **Database**: PostgreSQL with Prisma ORM for robust data management

## API Endpoints

### Payment Orders
- `POST /api/v1/payments/orders` - Create a new payment order
- `POST /api/v1/payments/verify` - Verify payment after completion
- `GET /api/v1/payments/orders/:orderId/status` - Get payment status

### School Payments
- `GET /api/v1/payments/schools/:schoolId/payments` - Get payments for a school

### Refunds
- `POST /api/v1/payments/refunds` - Create a refund

### Statistics
- `GET /api/v1/payments/stats` - Get payment statistics

### Receipts
- `GET /api/v1/payments/receipts/:receiptId/download` - Download receipt PDF

### Webhooks
- `POST /api/v1/payments/webhook` - Razorpay webhook endpoint

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
# Server Configuration
NODE_ENV=development
PORT=3005
API_PREFIX=/api/v1

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/payment_db

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Other configurations...
```

## Database Schema

The service uses the following main tables:

### school_payments
- Stores all payment transactions
- Links to school-service via schoolId
- Tracks payment status, amounts, and Razorpay data

### receipt_logs
- Stores PDF receipt information
- Links to payments for audit trail
- Tracks download counts and email status

### payment_webhooks
- Stores webhook events from Razorpay
- Ensures idempotency and retry logic
- Audit trail for webhook processing

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Database
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed database
pnpm db:seed
```

### 3. Configure Razorpay
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Generate API keys (Test mode for development)
3. Set up webhook URL: `https://yourdomain.com/api/v1/payments/webhook`
4. Update environment variables

### 4. Start Development Server
```bash
pnpm dev
```

### 5. Test the Service
Visit `http://localhost:3005/health` to verify the service is running.

## Payment Flow

### 1. Create Order
```javascript
POST /api/v1/payments/orders
{
  "schoolId": "uuid-of-school",
  "amount": 500.00,
  "notes": {
    "purpose": "school_registration"
  }
}
```

### 2. Initialize Razorpay Checkout
```javascript
const options = {
  key: 'RAZORPAY_KEY_ID',
  amount: order.amount,
  currency: 'INR',
  order_id: order.id,
  handler: function(response) {
    // Verify payment
    verifyPayment(response);
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### 3. Verify Payment
```javascript
POST /api/v1/payments/verify
{
  "razorpayOrderId": "order_xyz",
  "razorpayPaymentId": "pay_abc",
  "razorpaySignature": "signature_hash"
}
```

## Webhook Events

The service handles these Razorpay webhook events:

- `payment.captured` - Payment successful
- `payment.failed` - Payment failed
- `order.paid` - Order completed
- `payment.refunded` - Refund processed

## Receipt Generation

- PDF receipts are automatically generated for successful payments
- Refund receipts are created for refunds
- Receipts are stored locally and can be downloaded via API
- Receipt templates include company branding and payment details

## Security Features

- Rate limiting on all endpoints
- Webhook signature verification
- Input validation with Zod schemas
- SQL injection prevention with Prisma
- CORS protection
- Helmet security headers

## Error Handling

The service provides structured error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Monitoring and Logging

- Request/response logging with Morgan
- Database query logging
- Error tracking and reporting
- Payment status monitoring

## Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:reset         # Reset database
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
pnpm db:clean         # Clean database

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier
pnpm type-check       # TypeScript type checking
```

## Testing

Use these test cards for development:

| Card Network | Card Number | CVV | Expiry |
|-------------|-------------|-----|--------|
| Visa | 4111 1111 1111 1111 | 123 | Any future date |
| Mastercard | 5555 5555 5555 4444 | 123 | Any future date |

UPI IDs for testing:
- `success@razorpay` - Successful payment
- `failure@razorpay` - Failed payment

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production Razorpay keys
3. Configure proper database URL
4. Set up SSL certificates
5. Configure webhook URL with HTTPS
6. Set up monitoring and alerting

## Support

For issues and questions:
- Check the logs for detailed error information
- Verify Razorpay configuration
- Ensure database connectivity
- Check webhook signature verification

## License

This project is licensed under the ISC License.
