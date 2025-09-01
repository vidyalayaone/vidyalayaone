import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import rateLimit from 'express-rate-limit';
import paymentController from '../controllers/paymentController';
import config from '../config/config';

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
router.post('/orders', paymentController.createOrder.bind(paymentController));
router.post('/create-order', paymentController.createOrder.bind(paymentController)); // Alias for frontend compatibility
router.post('/verify', paymentController.verifyPayment.bind(paymentController));
router.post('/verify-payment', paymentController.verifyPayment.bind(paymentController)); // Alias for frontend compatibility

// Payment status and information routes
router.get('/orders/:orderId/status', paymentController.getPaymentStatus.bind(paymentController));
router.get('/schools/:schoolId/payments', paymentController.getSchoolPayments.bind(paymentController));
router.get('/schools/:schoolId/payment-status', paymentController.checkSchoolPaymentStatus.bind(paymentController));

// Refund routes
router.post('/refunds', paymentController.createRefund.bind(paymentController));

// Statistics routes
router.get('/stats', paymentController.getPaymentStats.bind(paymentController));

// Receipt routes
router.get('/receipts/:receiptId/download', paymentController.downloadReceipt.bind(paymentController));

// Webhook routes (no rate limiting applied here as it's handled above)
router.post('/webhook', paymentController.handleWebhook.bind(paymentController));

export default router;
