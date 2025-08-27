/**
 * Example integration of Payment Service in frontend
 * This shows how to create orders, handle payments, and verify them
 */

// Payment API Service
class PaymentAPI {
  private baseURL = 'http://localhost:3005/api/v1/payments';

  /**
   * Create a payment order
   */
  async createOrder(schoolId: string, amount: number, notes?: Record<string, any>) {
    const response = await fetch(`${this.baseURL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schoolId,
        amount,
        notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment order');
    }

    return response.json();
  }

  /**
   * Verify payment
   */
  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const response = await fetch(`${this.baseURL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    return response.json();
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId: string) {
    const response = await fetch(`${this.baseURL}/orders/${orderId}/status`);

    if (!response.ok) {
      throw new Error('Failed to get payment status');
    }

    return response.json();
  }

  /**
   * Get school payments
   */
  async getSchoolPayments(schoolId: string, page = 1, limit = 10) {
    const response = await fetch(
      `${this.baseURL}/schools/${schoolId}/payments?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to get school payments');
    }

    return response.json();
  }

  /**
   * Download receipt
   */
  async downloadReceipt(receiptId: string) {
    const response = await fetch(`${this.baseURL}/receipts/${receiptId}/download`);

    if (!response.ok) {
      throw new Error('Failed to download receipt');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Payment Handler Class
class PaymentHandler {
  private paymentAPI = new PaymentAPI();
  private razorpayKeyId = 'YOUR_RAZORPAY_KEY_ID'; // Replace with your actual key

  /**
   * Initialize payment for school registration
   */
  async initiateSchoolRegistrationPayment(schoolData: {
    schoolId: string;
    amount: number;
    schoolName: string;
    contactEmail: string;
    contactPhone: string;
  }) {
    try {
      // Step 1: Create order
      const orderResponse = await this.paymentAPI.createOrder(
        schoolData.schoolId,
        schoolData.amount,
        {
          purpose: 'school_registration',
          schoolName: schoolData.schoolName,
        }
      );

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      const { order } = orderResponse.data;

      // Step 2: Configure Razorpay options
      const options = {
        key: this.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'VidyalayaOne',
        description: 'School Registration Payment',
        order_id: order.id,
        handler: async (response: any) => {
          await this.handlePaymentSuccess(response);
        },
        prefill: {
          name: schoolData.schoolName,
          email: schoolData.contactEmail,
          contact: schoolData.contactPhone,
        },
        theme: {
          color: '#4CAF50',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
          },
        },
      };

      // Step 3: Open Razorpay checkout
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    try {
      // Verify payment on backend
      const verificationResponse = await this.paymentAPI.verifyPayment(response);

      if (verificationResponse.success) {
        const { payment, receipt } = verificationResponse.data;
        
        // Show success message
        this.showSuccessMessage({
          paymentId: payment.razorpayPaymentId,
          amount: payment.amount / 100, // Convert from paise to rupees
          receiptId: receipt.id,
        });

        // Redirect to success page or update UI
        this.onPaymentSuccess(payment, receipt);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      this.showErrorMessage('Payment verification failed. Please contact support.');
    }
  }

  /**
   * Show success message
   */
  private showSuccessMessage(data: {
    paymentId: string;
    amount: number;
    receiptId: string;
  }) {
    alert(`
      Payment Successful! 
      
      Payment ID: ${data.paymentId}
      Amount: ₹${data.amount}
      
      Your receipt will be downloaded automatically.
    `);

    // Download receipt
    this.paymentAPI.downloadReceipt(data.receiptId);
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string) {
    alert(`Payment Failed: ${message}`);
  }

  /**
   * Callback for successful payment (override this)
   */
  protected onPaymentSuccess(payment: any, receipt: any) {
    console.log('Payment successful:', { payment, receipt });
    // Implement your success logic here
    // For example: redirect to dashboard, update school status, etc.
  }
}

// Usage Example
export class SchoolRegistrationPayment extends PaymentHandler {
  /**
   * Handle school registration payment
   */
  async handleSchoolRegistration(schoolData: {
    schoolId: string;
    schoolName: string;
    contactEmail: string;
    contactPhone: string;
    registrationAmount: number;
  }) {
    try {
      await this.initiateSchoolRegistrationPayment({
        schoolId: schoolData.schoolId,
        amount: schoolData.registrationAmount,
        schoolName: schoolData.schoolName,
        contactEmail: schoolData.contactEmail,
        contactPhone: schoolData.contactPhone,
      });
    } catch (error) {
      console.error('School registration payment failed:', error);
      throw error;
    }
  }

  /**
   * Override success callback for school registration
   */
  protected onPaymentSuccess(payment: any, receipt: any) {
    console.log('School registration payment successful!');
    
    // Update school status to active/paid
    // Redirect to school dashboard
    // Send confirmation email
    // Update UI to show success state
    
    window.location.href = '/dashboard?payment=success';
  }
}

import React, { useState } from 'react';

// React Component Example (if using React)
export const PaymentButton: React.FC<{
  schoolData: {
    schoolId: string;
    schoolName: string;
    contactEmail: string;
    contactPhone: string;
    registrationAmount: number;
  };
}> = ({ schoolData }) => {
  const [loading, setLoading] = useState(false);
  const paymentHandler = new SchoolRegistrationPayment();

  const handlePayment = async () => {
    setLoading(true);
    try {
      await paymentHandler.handleSchoolRegistration(schoolData);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="payment-button"
    >
      {loading ? 'Processing...' : `Pay ₹${schoolData.registrationAmount}`}
    </button>
  );
};

// HTML Example (if using vanilla HTML/JS)
export const createPaymentForm = (containerId: string, schoolData: any) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="payment-form">
      <h3>School Registration Payment</h3>
      <div class="school-info">
        <p><strong>School:</strong> ${schoolData.schoolName}</p>
        <p><strong>Amount:</strong> ₹${schoolData.registrationAmount}</p>
      </div>
      <button id="pay-button" class="payment-button">
        Pay Now
      </button>
    </div>
  `;

  const payButton = document.getElementById('pay-button');
  const paymentHandler = new SchoolRegistrationPayment();

  payButton?.addEventListener('click', async () => {
    payButton.textContent = 'Processing...';
    payButton.setAttribute('disabled', 'true');

    try {
      await paymentHandler.handleSchoolRegistration(schoolData);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      payButton.textContent = 'Pay Now';
      payButton.removeAttribute('disabled');
    }
  });
};

export { PaymentAPI, PaymentHandler };
