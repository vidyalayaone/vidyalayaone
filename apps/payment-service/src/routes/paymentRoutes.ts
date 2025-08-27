import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import rateLimit from 'express-rate-limit';
import PaymentController from '@/controllers/paymentController';
import config from '@/config/config';

const router: ExpressRouter = Router();

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.security.apiRateLimit, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for webhook endpoints (more restrictive)
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.security.webhookRateLimit, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many webhook requests',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use('/webhook', webhookLimiter);
router.use(apiLimiter);

// Payment order routes
router.post('/orders', PaymentController.createOrder);
router.post('/verify', PaymentController.verifyPayment);

// Payment status and information routes
router.get('/orders/:orderId/status', PaymentController.getPaymentStatus);
router.get('/schools/:schoolId/payments', PaymentController.getSchoolPayments);

// Refund routes
router.post('/refunds', PaymentController.createRefund);

// Statistics routes
router.get('/stats', PaymentController.getPaymentStats);

// Receipt routes
router.get('/receipts/:receiptId/download', PaymentController.downloadReceipt);

// Webhook routes (no rate limiting applied here as it's handled above)
router.post('/webhook', PaymentController.handleWebhook);

export default router;
