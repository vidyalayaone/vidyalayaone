import DatabaseService from './database';
import PaymentService from './payment';
import RazorpayService from './razorpay';
import axios from 'axios';
import config from '../config/config';
import { PaymentWebhook, PaymentStatus, PrismaClient } from '../generated/client';

interface WebhookEvent {
  account_id: string;
  contains: string[];
  created_at: number;
  entity: string;
  event: string;
  payload: {
    payment?: {
      entity: any;
    };
    order?: {
      entity: any;
    };
  };
}

class WebhookService {
  private db: PrismaClient | null = null;
  private paymentService: PaymentService | null = null;

  private getDB(): PrismaClient {
    if (!this.db) {
      this.db = DatabaseService.getInstance();
    }
    return this.db;
  }

  private getPaymentService(): PaymentService {
    if (!this.paymentService) {
      this.paymentService = new PaymentService();
    }
    return this.paymentService;
  }

  /**
   * Process webhook event
   */
  async processWebhook(signature: string, payload: string): Promise<void> {
    try {
      // Verify webhook signature
      const isValid = RazorpayService.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

  const event: WebhookEvent = JSON.parse(payload);
      
      // Store webhook event
      const webhookRecord = await this.storeWebhookEvent(event);
      
      try {
        // Process the event based on type
        await this.handleWebhookEvent(event);
        
        // Mark webhook as processed
        await this.markWebhookProcessed(webhookRecord.id);
      } catch (error) {
        console.error('Error processing webhook event:', error);
        
        // Mark webhook as failed with error message
        await this.markWebhookFailed(
          webhookRecord.id, 
          error instanceof Error ? error.message : 'Unknown error'
        );
        
        throw error;
      }
    } catch (error) {
      console.error('Error in webhook processing:', error);
      throw error;
    }
  }

  /**
   * Store webhook event in database
   */
  private async storeWebhookEvent(event: WebhookEvent): Promise<PaymentWebhook> {
    try {
      // Prefer payment/entity id + created_at for uniqueness if available
      const baseId = event.payload.payment?.entity?.id || event.payload.order?.entity?.id || `${event.account_id}_${event.created_at}`;
      const compositeId = `${baseId}_${event.created_at}`;

      const existingWebhook = await this.getDB().paymentWebhook.findUnique({
        where: { razorpayEventId: compositeId },
      });
      if (existingWebhook) return existingWebhook;

      return await this.getDB().paymentWebhook.create({
        data: {
          razorpayEventId: compositeId,
          event: event.event,
          accountId: event.account_id,
          entity: event.entity,
          payload: JSON.parse(JSON.stringify(event)),
        },
      });
    } catch (error) {
      console.error('Error storing webhook event:', error);
      throw error;
    }
  }

  /**
   * Handle different types of webhook events
   */
  private async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    switch (event.event) {
      case 'payment.authorized':
        await this.handlePaymentAuthorized(event);
        break;
        
      case 'payment.captured':
        await this.handlePaymentCaptured(event);
        break;
      
      case 'payment.failed':
        await this.handlePaymentFailed(event);
        break;
      
      case 'order.paid':
        await this.handleOrderPaid(event);
        break;
      
      case 'payment.refunded':
        await this.handlePaymentRefunded(event);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }
  }

  /**
   * Handle payment authorized event (payment is successful but not yet captured)
   */
  private async handlePaymentAuthorized(event: WebhookEvent): Promise<void> {
    try {
      const payment = event.payload.payment?.entity;
      if (!payment) return;

      const orderId = payment.order_id;
      if (!orderId) return;

      // Find payment record
      const paymentRecord = await this.getPaymentService().getPaymentByOrderId(orderId);
      if (!paymentRecord) {
        console.log(`Payment record not found for order: ${orderId}`);
        return;
      }

      // Update payment status to ATTEMPTED (authorized but not captured)
      if (paymentRecord.status === PaymentStatus.CREATED) {
        await this.getDB().schoolPayment.update({
          where: { id: paymentRecord.id },
          data: {
            status: PaymentStatus.ATTEMPTED,
            razorpayPaymentId: payment.id,
            paymentMethod: payment.method,
            paymentMethodDetails: payment,
            attempts: paymentRecord.attempts + 1,
          },
        });

        console.log(`Payment authorized via webhook: ${payment.id}`);
      }
    } catch (error) {
      console.error('Error handling payment authorized:', error);
      throw error;
    }
  }

  /**
   * Handle payment captured event
   */
  private async handlePaymentCaptured(event: WebhookEvent): Promise<void> {
    try {
      const payment = event.payload.payment?.entity;
      if (!payment) return;

      const orderId = payment.order_id;
      if (!orderId) return;

      // Find payment record
      const paymentRecord = await this.getPaymentService().getPaymentByOrderId(orderId);
      if (!paymentRecord) {
        console.log(`Payment record not found for order: ${orderId}`);
        return;
      }

      // Update payment status if not already updated
      if (paymentRecord.status !== PaymentStatus.PAID) {
        const updatedPayment = await this.getDB().schoolPayment.update({
          where: { id: paymentRecord.id },
          data: {
            status: PaymentStatus.PAID,
            razorpayPaymentId: payment.id,
            paymentMethod: payment.method,
            paymentMethodDetails: payment,
            paidAt: new Date(payment.created_at * 1000),
          },
        });

        // **CRITICAL**: Update school plan after successful payment via webhook
        // This ensures plan is updated even if frontend verification was missed
        await this.updateSchoolPlan(paymentRecord.schoolId, 'basic');

        // **NEW**: Send success notification email (optional)
        await this.sendPaymentSuccessNotification(updatedPayment);

        console.log(`[WEBHOOK] Payment captured and school plan updated: ${payment.id}`);
      } else {
        console.log(`[WEBHOOK] Payment already processed: ${payment.id}`);
      }
    } catch (error) {
      console.error('Error handling payment captured:', error);
      throw error;
    }
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(event: WebhookEvent): Promise<void> {
    try {
      const payment = event.payload.payment?.entity;
      if (!payment) return;

      const orderId = payment.order_id;
      if (!orderId) return;

      // Find payment record
      const paymentRecord = await this.getPaymentService().getPaymentByOrderId(orderId);
      if (!paymentRecord) {
        console.log(`Payment record not found for order: ${orderId}`);
        return;
      }

      // Update payment status
      await this.getPaymentService().handlePaymentFailure(
        orderId,
        payment.error_description || 'Payment failed'
      );

      console.log(`Payment failed via webhook: ${payment.id}`);
    } catch (error) {
      console.error('Error handling payment failed:', error);
      throw error;
    }
  }

  /**
   * Handle order paid event
   */
  private async handleOrderPaid(event: WebhookEvent): Promise<void> {
    try {
      const order = event.payload.order?.entity;
      if (!order) return;

      // Find payment record
      const paymentRecord = await this.getPaymentService().getPaymentByOrderId(order.id);
      if (!paymentRecord) {
        console.log(`Payment record not found for order: ${order.id}`);
        return;
      }

      // Update payment status if not already updated
      if (paymentRecord.status !== PaymentStatus.PAID) {
        await this.getDB().schoolPayment.update({
          where: { id: paymentRecord.id },
          data: {
            status: PaymentStatus.PAID,
            paidAt: new Date(),
          },
        });

        console.log(`Order paid via webhook: ${order.id}`);
      }
    } catch (error) {
      console.error('Error handling order paid:', error);
      throw error;
    }
  }

  /**
   * Handle payment refunded event
   */
  private async handlePaymentRefunded(event: WebhookEvent): Promise<void> {
    try {
      const payment = event.payload.payment?.entity;
      if (!payment) return;

      const orderId = payment.order_id;
      if (!orderId) return;

      // Find payment record
      const paymentRecord = await this.getPaymentService().getPaymentByOrderId(orderId);
      if (!paymentRecord) {
        console.log(`Payment record not found for order: ${orderId}`);
        return;
      }

      // Determine refund status
      const refundAmount = payment.amount_refunded || 0;
      const originalAmount = payment.amount || 0;
      
      const status = refundAmount >= originalAmount 
        ? PaymentStatus.REFUNDED 
        : PaymentStatus.PARTIAL_REFUND;

      // Update payment status
      await this.getDB().schoolPayment.update({
        where: { id: paymentRecord.id },
        data: { status },
      });

      console.log(`Payment refunded via webhook: ${payment.id}`);
    } catch (error) {
      console.error('Error handling payment refunded:', error);
      throw error;
    }
  }

  /**
   * Mark webhook as processed
   */
  private async markWebhookProcessed(webhookId: string): Promise<void> {
    await this.getDB().paymentWebhook.update({
      where: { id: webhookId },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  }

  /**
   * Mark webhook as failed
   */
  private async markWebhookFailed(webhookId: string, errorMessage: string): Promise<void> {
    await this.getDB().paymentWebhook.update({
      where: { id: webhookId },
      data: {
        errorMessage,
        retryCount: { increment: 1 },
      },
    });
  }

  /**
   * Send payment success notification (optional - for user communication)
   */
  private async sendPaymentSuccessNotification(payment: any): Promise<void> {
    try {
      // TODO: Implement email/SMS notification service
      // For now, just log the event
      console.log(`[WEBHOOK] Payment success notification triggered for payment: ${payment.id}`);
      
      // Future implementation could include:
      // - Email to school admin
      // - SMS notification
      // - Push notification
      // - Slack/Discord webhook
    } catch (error) {
      console.error('[WEBHOOK] Error sending payment notification:', error);
      // Don't throw - this is non-critical
    }
  }

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
      console.log(`[WEBHOOK] Updated school plan: ${schoolId} -> ${plan}`);
    } catch (error) {
      console.error('[WEBHOOK] Error updating school plan:', error);
      // Don't throw error as webhook should still be marked as processed
      // This is a business logic action, not a webhook processing failure
    }
  }

  /**
   * Retry failed webhooks
   */
  async retryFailedWebhooks(maxRetries: number = 3): Promise<void> {
    try {
      const failedWebhooks = await this.getDB().paymentWebhook.findMany({
        where: {
          processed: false,
          retryCount: { lt: maxRetries },
        },
        orderBy: { createdAt: 'asc' },
        take: 10, // Process 10 at a time
      });

      for (const webhook of failedWebhooks) {
        try {
          await this.handleWebhookEvent(webhook.payload as unknown as WebhookEvent);
          await this.markWebhookProcessed(webhook.id);
          console.log(`Retry successful for webhook: ${webhook.id}`);
        } catch (error) {
          await this.markWebhookFailed(
            webhook.id,
            error instanceof Error ? error.message : 'Retry failed'
          );
          console.error(`Retry failed for webhook: ${webhook.id}`, error);
        }
      }
    } catch (error) {
      console.error('Error retrying failed webhooks:', error);
    }
  }
}

export default WebhookService;
