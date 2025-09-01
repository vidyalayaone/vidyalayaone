import DatabaseService from './database';
import RazorpayService from './razorpay';
import ReceiptService from './receipt';
import { SchoolPayment, PaymentStatus, ReceiptLog, PrismaClient } from '../generated/client';
import type { SchoolPayment as SchoolPaymentWithIncludes } from '../generated/client';
import { v4 as uuidv4 } from 'uuid';

interface CreatePaymentOrderParams {
  schoolId: string;
  amount: number;
  notes?: Record<string, any>;
}

interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

class PaymentService {
  private db: PrismaClient | null = null;
  private receiptService: ReceiptService | null = null;

  private getDB(): PrismaClient {
    if (!this.db) {
      this.db = DatabaseService.getInstance();
    }
    return this.db;
  }

  private getReceiptService(): ReceiptService {
    if (!this.receiptService) {
      this.receiptService = new ReceiptService();
    }
    return this.receiptService;
  }

  /**
   * Create a new payment order for school registration
   */
  async createPaymentOrder(params: CreatePaymentOrderParams): Promise<{
    order: any;
    payment: SchoolPayment;
  }> {
    try {
      // Generate custom receipt number
      const receipt = `RCP_${Date.now()}_${params.schoolId.substring(0, 8)}`;

      // Create Razorpay order
      const razorpayOrder = await RazorpayService.createOrder({
        amount: params.amount,
        schoolId: params.schoolId,
        receipt,
        notes: params.notes,
      });

      // Store payment record in database
      const payment = await this.getDB().schoolPayment.create({
        data: {
          schoolId: params.schoolId,
          razorpayOrderId: razorpayOrder.id,
          amount: typeof razorpayOrder.amount === 'string' ? parseInt(razorpayOrder.amount) : razorpayOrder.amount,
          currency: razorpayOrder.currency,
          status: PaymentStatus.CREATED,
          receipt,
          notes: params.notes || {},
        },
      });

      return {
        order: razorpayOrder,
        payment,
      };
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw new Error(`Failed to create payment order: ${error}`);
    }
  }

  /**
   * Verify and process payment
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<SchoolPayment> {
    try {
      // Verify signature
      const isValidSignature = RazorpayService.verifyPaymentSignature(params);
      
      if (!isValidSignature) {
        throw new Error('Invalid payment signature');
      }

      // Find payment record
      const payment = await this.getDB().schoolPayment.findUnique({
        where: { razorpayOrderId: params.razorpayOrderId },
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Idempotency: if already paid and the same payment id is supplied, return existing record
      if (payment.status === PaymentStatus.PAID && payment.razorpayPaymentId === params.razorpayPaymentId) {
        return payment;
      }

      // Fetch payment details from Razorpay
      const razorpayPayment = await RazorpayService.fetchPayment(params.razorpayPaymentId);

      // Update payment record
      const updatedPayment = await this.getDB().schoolPayment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature,
          status: PaymentStatus.PAID,
          paymentMethod: razorpayPayment.method,
          paymentMethodDetails: JSON.parse(JSON.stringify(razorpayPayment)),
          paidAt: new Date(),
          attempts: payment.attempts + 1,
        },
      });

      // Generate receipt (non-blocking)
      // Prevent duplicate receipt generation
      const existingReceipt = await this.getDB().receiptLog.findFirst({
        where: { schoolPaymentId: updatedPayment.id, receiptType: 'PAYMENT_RECEIPT' },
      });
      if (!existingReceipt) {
        // Generate receipt asynchronously without blocking payment verification
        this.generatePaymentReceipt(updatedPayment).catch(error => {
          console.error('Error generating payment receipt (non-blocking):', error);
        });
      }

      return updatedPayment;
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      // Update payment status to failed if possible
      try {
        await this.getDB().schoolPayment.updateMany({
          where: { razorpayOrderId: params.razorpayOrderId },
          data: {
            status: PaymentStatus.FAILED,
            failureReason: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      } catch (updateError) {
        console.error('Error updating payment status to failed:', updateError);
      }

      throw error;
    }
  }

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(orderId: string, reason: string): Promise<void> {
    try {
      await this.getDB().schoolPayment.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: reason,
        },
      });
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<any> {
    try {
      return await this.getDB().schoolPayment.findUnique({
        where: { razorpayOrderId: orderId },
        include: { receiptLogs: true },
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by school ID
   */
  async getPaymentsBySchoolId(schoolId: string): Promise<SchoolPayment[]> {
    try {
      return await this.getDB().schoolPayment.findMany({
        where: { schoolId },
        include: { receiptLogs: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching payments by school ID:', error);
      throw error;
    }
  }

  /**
   * Generate payment receipt
   */
  private async generatePaymentReceipt(payment: SchoolPayment): Promise<ReceiptLog> {
    try {
      const receiptNumber = `RCP_${payment.id.substring(0, 8)}_${Date.now()}`;
      
      const receipt = await this.getReceiptService().generatePaymentReceipt({
        payment,
        receiptNumber,
      });

      return await this.getDB().receiptLog.create({
        data: {
          schoolPaymentId: payment.id,
          receiptNumber,
          receiptType: 'PAYMENT_RECEIPT',
          filePath: receipt.filePath,
          fileUrl: receipt.fileUrl,
          fileSize: receipt.fileSize,
        },
      });
    } catch (error) {
      console.error('Error generating payment receipt:', error);
      throw error;
    }
  }

  /**
   * Create refund
   */
  async createRefund(paymentId: string, amount?: number, notes?: Record<string, any>): Promise<{
    refund: any;
    payment: SchoolPayment;
  }> {
    try {
      const payment = await this.getDB().schoolPayment.findUnique({
        where: { id: paymentId },
      });

      if (!payment || !payment.razorpayPaymentId) {
        throw new Error('Payment not found or not paid');
      }

      // Create refund in Razorpay
      const refund = await RazorpayService.createRefund(
        payment.razorpayPaymentId,
        amount,
        notes
      );

      // Update payment status
      const status = amount && amount < (payment.amount / 100) 
        ? PaymentStatus.PARTIAL_REFUND 
        : PaymentStatus.REFUNDED;

      const updatedPayment = await this.getDB().schoolPayment.update({
        where: { id: paymentId },
        data: { status },
      });

      // Generate refund receipt
      const receiptNumber = `REF_${payment.id.substring(0, 8)}_${Date.now()}`;
      await this.getReceiptService().generateRefundReceipt({
        payment: updatedPayment,
        refund,
        receiptNumber,
      });

      return {
        refund,
        payment: updatedPayment,
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(schoolId?: string): Promise<{
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalAmount: number;
    successfulAmount: number;
  }> {
    try {
      const whereClause = schoolId ? { schoolId } : {};

      const [totalPayments, successfulPayments, failedPayments, amounts] = await Promise.all([
        this.getDB().schoolPayment.count({ where: whereClause }),
        this.getDB().schoolPayment.count({ 
          where: { ...whereClause, status: PaymentStatus.PAID } 
        }),
        this.getDB().schoolPayment.count({ 
          where: { ...whereClause, status: PaymentStatus.FAILED } 
        }),
        this.getDB().schoolPayment.aggregate({
          where: whereClause,
          _sum: { amount: true },
        }),
      ]);

      const successfulAmountResult = await this.getDB().schoolPayment.aggregate({
        where: { ...whereClause, status: PaymentStatus.PAID },
        _sum: { amount: true },
      });

      return {
        totalPayments,
        successfulPayments,
        failedPayments,
        totalAmount: (amounts._sum.amount || 0) / 100, // Convert to rupees
        successfulAmount: (successfulAmountResult._sum.amount || 0) / 100, // Convert to rupees
      };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }
}

export default PaymentService;
