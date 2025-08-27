import Razorpay from 'razorpay';
import * as crypto from 'node:crypto';
import config from '@/config/config';

class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }

  /**
   * Create a new order for school registration payment
   */
  async createOrder(params: {
    amount: number; // Amount in rupees (will be converted to paise)
    schoolId: string;
    receipt?: string;
    notes?: Record<string, any>;
  }) {
    try {
      const orderOptions = {
        amount: Math.round(params.amount * 100), // Convert to paise
        currency: 'INR',
        receipt: params.receipt || `school_${params.schoolId}_${Date.now()}`,
        notes: {
          schoolId: params.schoolId,
          purpose: 'school_registration',
          ...params.notes,
        },
      };

      const order = await this.razorpay.orders.create(orderOptions);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(`Failed to create payment order: ${error}`);
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
      
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(body)
        .digest('hex');

  // Use constant-time comparison to mitigate timing attacks
  const expected = Buffer.from(expectedSignature, 'utf8');
  const provided = Buffer.from(razorpaySignature, 'utf8');
  return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.webhookSecret)
        .update(payload)
        .digest('hex');

  const expected = Buffer.from(expectedSignature, 'utf8');
  const provided = Buffer.from(signature, 'utf8');
  return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay
   */
  async fetchPayment(paymentId: string) {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new Error(`Failed to fetch payment: ${error}`);
    }
  }

  /**
   * Fetch order details from Razorpay
   */
  async fetchOrder(orderId: string) {
    try {
      return await this.razorpay.orders.fetch(orderId);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error(`Failed to fetch order: ${error}`);
    }
  }

  /**
   * Create refund for a payment
   */
  async createRefund(paymentId: string, amount?: number, notes?: Record<string, any>) {
    try {
      const refundOptions: any = {
        notes: notes || {},
      };

      if (amount) {
        refundOptions.amount = Math.round(amount * 100); // Convert to paise
      }

      return await this.razorpay.payments.refund(paymentId, refundOptions);
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error(`Failed to create refund: ${error}`);
    }
  }

  /**
   * Fetch all refunds for a payment
   */
  async fetchRefunds(paymentId: string) {
    try {
      return await this.razorpay.payments.fetchMultipleRefund(paymentId);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      throw new Error(`Failed to fetch refunds: ${error}`);
    }
  }
}

export default new RazorpayService();
