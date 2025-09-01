import { Request, Response, NextFunction } from 'express';
import PaymentService from '../services/payment';
import WebhookService from '../services/webhook';
import DatabaseService from '../services/database';
import axios from 'axios';
import config from '../config/config';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  paymentStatusQuerySchema,
  schoolPaymentsQuerySchema,
  createRefundSchema,
  receiptDownloadSchema,
  paymentStatsQuerySchema,
  webhookSchema,
} from '../validations/paymentValidations';
import {
  ApiResponse,
  PaymentOrderResponse,
  PaymentVerificationResponse,
  PaymentStatusResponse,
  SchoolPaymentsResponse,
  RefundResponse,
  PaymentStatsResponse,
  ErrorResponse,
} from '../types/payment';

class PaymentController {
  private paymentService = new PaymentService();
  private webhookService = new WebhookService();

  /**
   * Update school plan after successful payment
   */
  private async updateSchoolPlan(schoolId: string, plan: string): Promise<void> {
    try {
      // Make internal call to school service to update plan
      await axios.patch(
        `${config.services.schoolService.url}/api/v1/school/${schoolId}/plan`,
        { plan },
        {
          timeout: config.services.schoolService.timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Call': 'true',
            'X-Service-Auth': 'payment-service'
          }
        }
      );
      console.log(`Updated school plan: ${schoolId} -> ${plan}`);
    } catch (error) {
      console.error('Error updating school plan:', error);
      // Don't throw error as payment is already successful
      // This is a post-payment action
    }
  }

  /**
   * Create a new payment order for school registration
   */
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = createPaymentOrderSchema.safeParse({ body: req.body });
      
      if (!validation.success) {
        const response: ErrorResponse = {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        };
        res.status(400).json(response);
        return;
      }

      const { schoolId, amount, notes } = validation.data.body;

      const result = await this.paymentService.createPaymentOrder({
        schoolId,
        amount,
        notes,
      });

      const response: ApiResponse<PaymentOrderResponse> = {
        success: true,
        data: {
          order: result.order,
          payment: {
            id: result.payment.id,
            schoolId: result.payment.schoolId,
            razorpayOrderId: result.payment.razorpayOrderId,
            amount: result.payment.amount,
            currency: result.payment.currency,
            status: result.payment.status,
            receipt: result.payment.receipt || '',
            createdAt: result.payment.createdAt.toISOString(),
          },
        },
        message: 'Payment order created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify payment after successful payment
   */
  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = verifyPaymentSchema.safeParse({ body: req.body });
      
      if (!validation.success) {
        const response: ErrorResponse = {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        };
        res.status(400).json(response);
        return;
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data.body;

      const payment = await this.paymentService.verifyPayment({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });

      // After successful payment verification, update school plan
      await this.updateSchoolPlan(payment.schoolId, 'basic');

      // Get receipt information
      const receipts = await DatabaseService.getInstance().receiptLog.findMany({
        where: { schoolPaymentId: payment.id },
        orderBy: { generatedAt: 'desc' },
        take: 1,
      });

      const response: ApiResponse<PaymentVerificationResponse> = {
        success: true,
        data: {
          payment: {
            id: payment.id,
            schoolId: payment.schoolId,
            razorpayOrderId: payment.razorpayOrderId,
            razorpayPaymentId: payment.razorpayPaymentId || '',
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.paymentMethod || '',
            paidAt: payment.paidAt?.toISOString() || '',
          },
          receipt: receipts[0] ? {
            id: receipts[0].id,
            receiptNumber: receipts[0].receiptNumber,
            filePath: receipts[0].filePath,
            downloadUrl: `/api/v1/payments/receipts/${receipts[0].id}/download`,
          } : {} as any,
        },
        message: 'Payment verified successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment status by order ID
   */
  async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = paymentStatusQuerySchema.safeParse({ params: req.params });
      
      if (!validation.success) {
        const response: ErrorResponse = {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        };
        res.status(400).json(response);
        return;
      }

      const { orderId } = validation.data.params;

      const payment = await this.paymentService.getPaymentByOrderId(orderId);

      if (!payment) {
        const response: ErrorResponse = {
          success: false,
          error: 'Payment not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<PaymentStatusResponse> = {
        success: true,
        data: {
          payment: {
            id: payment.id,
            schoolId: payment.schoolId,
            razorpayOrderId: payment.razorpayOrderId,
            razorpayPaymentId: payment.razorpayPaymentId || undefined,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.paymentMethod || undefined,
            failureReason: payment.failureReason || undefined,
            attempts: payment.attempts,
            createdAt: payment.createdAt.toISOString(),
            paidAt: payment.paidAt?.toISOString(),
          },
          receipts: payment.receiptLogs?.map((receipt: any) => ({
            id: receipt.id,
            receiptNumber: receipt.receiptNumber,
            receiptType: receipt.receiptType,
            generatedAt: receipt.generatedAt.toISOString(),
            downloadUrl: `/api/v1/payments/receipts/${receipt.id}/download`,
          })) || [],
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payments for a specific school
   */
  async getSchoolPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = schoolPaymentsQuerySchema.safeParse({
        params: req.params,
        query: req.query,
      });
      
      if (!validation.success) {
        const response: ErrorResponse = {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        };
        res.status(400).json(response);
        return;
      }

      const { schoolId } = validation.data.params;
      const { status, page = 1, limit = 10 } = validation.data.query;

      const whereClause: any = { schoolId };
      if (status) {
        whereClause.status = status;
      }

      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        DatabaseService.getInstance().schoolPayment.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        DatabaseService.getInstance().schoolPayment.count({ where: whereClause }),
      ]);

      const response: ApiResponse<SchoolPaymentsResponse> = {
        success: true,
        data: {
          payments: payments.map((payment: any) => ({
            id: payment.id,
            razorpayOrderId: payment.razorpayOrderId,
            razorpayPaymentId: payment.razorpayPaymentId || undefined,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.paymentMethod || undefined,
            receipt: payment.receipt || undefined,
            createdAt: payment.createdAt.toISOString(),
            paidAt: payment.paidAt?.toISOString(),
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create refund for a payment
   */
  async createRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = createRefundSchema.safeParse({ body: req.body });
      
      if (!validation.success) {
        const response: ErrorResponse = {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        };
        res.status(400).json(response);
        return;
      }

      const { paymentId, amount, notes } = validation.data.body;

      const result = await this.paymentService.createRefund(paymentId, amount, notes);

      // Get the latest refund receipt
      const receipts = await DatabaseService.getInstance().receiptLog.findMany({
        where: { 
          schoolPaymentId: result.payment.id,
          receiptType: 'REFUND_RECEIPT',
        },
        orderBy: { generatedAt: 'desc' },
        take: 1,
      });

      const response: ApiResponse<RefundResponse> = {
        success: true,
        data: {
          refund: result.refund,
          payment: {
            id: result.payment.id,
            status: result.payment.status,
            updatedAt: result.payment.updatedAt.toISOString(),
          },
          receipt: receipts[0] ? {
            id: receipts[0].id,
            receiptNumber: receipts[0].receiptNumber,
            downloadUrl: `/api/v1/payments/receipts/${receipts[0].id}/download`,
          } : {} as any,
        },
        message: 'Refund created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check payment status for a school (used for recovery after window close)
   */
  async checkSchoolPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { schoolId } = req.params;

      if (!schoolId) {
        const response: ErrorResponse = {
          success: false,
          error: 'School ID is required',
        };
        res.status(400).json(response);
        return;
      }

      // Get latest payment for school
      const latestPayment = await DatabaseService.getInstance().schoolPayment.findFirst({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          amount: true,
          currency: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
          paidAt: true,
        },
      });

      if (!latestPayment) {
        const response: ErrorResponse = {
          success: false,
          error: 'No payment found for this school',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<any> = {
        success: true,
        data: {
          payment: {
            id: latestPayment.id,
            orderId: latestPayment.razorpayOrderId,
            paymentId: latestPayment.razorpayPaymentId,
            amount: latestPayment.amount,
            currency: latestPayment.currency,
            status: latestPayment.status,
            paymentMethod: latestPayment.paymentMethod,
            createdAt: latestPayment.createdAt.toISOString(),
            paidAt: latestPayment.paidAt?.toISOString(),
          },
        },
        message: 'Payment status retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = paymentStatsQuerySchema.safeParse({ query: req.query });
      
      if (!validation.success) {
        const response: ErrorResponse = {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        };
        res.status(400).json(response);
        return;
      }

      const { schoolId } = validation.data.query;

      const stats = await this.paymentService.getPaymentStats(schoolId);

      const response: ApiResponse<PaymentStatsResponse> = {
        success: true,
        data: {
          ...stats,
          successRate: stats.totalPayments > 0 
            ? Number(((stats.successfulPayments / stats.totalPayments) * 100).toFixed(2))
            : 0,
          averageAmount: stats.successfulPayments > 0 
            ? Number((stats.successfulAmount / stats.successfulPayments).toFixed(2))
            : 0,
          paymentMethods: {}, // TODO: Add payment method breakdown
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle webhook events from Razorpay
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = webhookSchema.safeParse({
        headers: req.headers,
        body: req.body,
      });
      
      if (!validation.success) {
        const response: ErrorResponse = {
          success: false,
          error: 'Invalid webhook data',
        };
        res.status(400).json(response);
        return;
      }

  const signature = req.headers['x-razorpay-signature'] as string;
  // Use raw body captured by express.raw middleware for HMAC calculation
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const payload = rawBody;

      await this.webhookService.processWebhook(signature, payload);

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(400).json({ 
        success: false, 
        error: 'Webhook processing failed' 
      });
    }
  }

  /**
   * Download receipt PDF
   */
  async downloadReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = receiptDownloadSchema.safeParse({ params: req.params });
      
      if (!validation.success) {
        const response: ErrorResponse = {
          success: false,
          error: 'Invalid receipt ID',
        };
        res.status(400).json(response);
        return;
      }

      const { receiptId } = validation.data.params;

      const receipt = await DatabaseService.getInstance().receiptLog.findUnique({
        where: { id: receiptId },
      });

      if (!receipt) {
        const response: ErrorResponse = {
          success: false,
          error: 'Receipt not found',
        };
        res.status(404).json(response);
        return;
      }

      // Update download count
      await DatabaseService.getInstance().receiptLog.update({
        where: { id: receiptId },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadedAt: new Date(),
        },
      });

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${receipt.receiptNumber}.pdf"`);
      
      // Send file
      res.sendFile(receipt.filePath);
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
