import { z } from 'zod';

// Create payment order validation
export const createPaymentOrderSchema = z.object({
  body: z.object({
    schoolId: z.string().uuid('Invalid school ID format'),
    amount: z.number().positive('Amount must be positive').min(1, 'Minimum amount is ₹1'),
    notes: z.record(z.string(), z.any()).optional(),
  }),
});

// Verify payment validation
export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, 'Order ID is required'),
    razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
    razorpay_signature: z.string().min(1, 'Signature is required'),
    schoolId: z.string().uuid('Invalid school ID format').optional(),
  }),
});

// Payment status query validation
export const paymentStatusQuerySchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
  }),
});

// School payments query validation
export const schoolPaymentsQuerySchema = z.object({
  params: z.object({
    schoolId: z.string().uuid('Invalid school ID format'),
  }),
  query: z.object({
    status: z.enum(['CREATED', 'ATTEMPTED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIAL_REFUND']).optional(),
    page: z.string().transform(Number).pipe(z.number().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().positive().max(100)).optional(),
  }),
});

// Create refund validation
export const createRefundSchema = z.object({
  body: z.object({
    paymentId: z.string().uuid('Invalid payment ID format'),
    amount: z.number().positive('Amount must be positive').optional(),
    notes: z.record(z.string(), z.any()).optional(),
  }),
});

// Webhook validation (basic structure)
export const webhookSchema = z.object({
  headers: z.object({
    'x-razorpay-signature': z.string().min(1, 'Webhook signature is required'),
  }),
  body: z.any(), // Webhook payload can vary
});

// Receipt download validation
export const receiptDownloadSchema = z.object({
  params: z.object({
    receiptId: z.string().uuid('Invalid receipt ID format'),
  }),
});

// Payment statistics query validation
export const paymentStatsQuerySchema = z.object({
  query: z.object({
    schoolId: z.string().uuid('Invalid school ID format').optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Types for TypeScript
export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>['body'];
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>['body'];
export type PaymentStatusParams = z.infer<typeof paymentStatusQuerySchema>['params'];
export type SchoolPaymentsParams = z.infer<typeof schoolPaymentsQuerySchema>['params'];
export type SchoolPaymentsQuery = z.infer<typeof schoolPaymentsQuerySchema>['query'];
export type CreateRefundInput = z.infer<typeof createRefundSchema>['body'];
export type ReceiptDownloadParams = z.infer<typeof receiptDownloadSchema>['params'];
export type PaymentStatsQuery = z.infer<typeof paymentStatsQuerySchema>['query'];
