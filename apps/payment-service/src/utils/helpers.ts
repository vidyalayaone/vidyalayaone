/**
 * Format amount from paise to rupees
 */
export const formatAmount = (amountInPaise: number): string => {
  const rupees = amountInPaise / 100;
  return `₹${rupees.toFixed(2)}`;
};

/**
 * Convert rupees to paise
 */
export const rupeesToPaise = (rupees: number): number => {
  return Math.round(rupees * 100);
};

/**
 * Convert paise to rupees
 */
export const paiseToRupees = (paise: number): number => {
  return paise / 100;
};

/**
 * Generate receipt number
 */
export const generateReceiptNumber = (prefix: string = 'RCP'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Validate Razorpay Order ID format
 */
export const isValidRazorpayOrderId = (orderId: string): boolean => {
  return /^order_[A-Za-z0-9]+$/.test(orderId);
};

/**
 * Validate Razorpay Payment ID format
 */
export const isValidRazorpayPaymentId = (paymentId: string): boolean => {
  return /^pay_[A-Za-z0-9]+$/.test(paymentId);
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Get payment status display text
 */
export const getPaymentStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    CREATED: 'Order Created',
    ATTEMPTED: 'Payment Attempted',
    PAID: 'Payment Successful',
    FAILED: 'Payment Failed',
    CANCELLED: 'Payment Cancelled',
    REFUNDED: 'Payment Refunded',
    PARTIAL_REFUND: 'Partially Refunded',
  };
  
  return statusMap[status] || status;
};

/**
 * Get payment method display text
 */
export const getPaymentMethodText = (method: string): string => {
  const methodMap: Record<string, string> = {
    card: 'Credit/Debit Card',
    netbanking: 'Net Banking',
    upi: 'UPI',
    wallet: 'Digital Wallet',
    emi: 'EMI',
    paylater: 'Pay Later',
    bank_transfer: 'Bank Transfer',
  };
  
  return methodMap[method] || method;
};

/**
 * Calculate success rate percentage
 */
export const calculateSuccessRate = (successful: number, total: number): number => {
  if (total === 0) return 0;
  return Number(((successful / total) * 100).toFixed(2));
};

/**
 * Calculate average amount
 */
export const calculateAverageAmount = (totalAmount: number, count: number): number => {
  if (count === 0) return 0;
  return Number((totalAmount / count).toFixed(2));
};

/**
 * Sanitize filename for PDF generation
 */
export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

/**
 * Get file extension from MIME type
 */
export const getFileExtension = (mimeType: string): string => {
  const extensions: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'text/plain': '.txt',
  };
  
  return extensions[mimeType] || '';
};

/**
 * Format date for Indian locale
 */
export const formatIndianDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date and time for Indian locale
 */
export const formatIndianDateTime = (date: Date): string => {
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};
