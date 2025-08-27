// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Payment Order Response
export interface PaymentOrderResponse {
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    created_at: number;
    notes: Record<string, any>;
  };
  payment: {
    id: string;
    schoolId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    status: string;
    receipt: string;
    createdAt: string;
  };
}

// Payment Verification Response
export interface PaymentVerificationResponse {
  payment: {
    id: string;
    schoolId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    paidAt: string;
  };
  receipt: {
    id: string;
    receiptNumber: string;
    filePath: string;
    downloadUrl: string;
  };
}

// Payment Status Response
export interface PaymentStatusResponse {
  payment: {
    id: string;
    schoolId: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    failureReason?: string;
    attempts: number;
    createdAt: string;
    paidAt?: string;
  };
  receipts: Array<{
    id: string;
    receiptNumber: string;
    receiptType: string;
    generatedAt: string;
    downloadUrl: string;
  }>;
}

// Payment Statistics Response
export interface PaymentStatsResponse {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalAmount: number;
  successfulAmount: number;
  successRate: number;
  averageAmount: number;
  paymentMethods: Record<string, number>;
  dailyStats?: Array<{
    date: string;
    payments: number;
    amount: number;
  }>;
}

// Refund Response
export interface RefundResponse {
  refund: {
    id: string;
    payment_id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: number;
  };
  payment: {
    id: string;
    status: string;
    updatedAt: string;
  };
  receipt: {
    id: string;
    receiptNumber: string;
    downloadUrl: string;
  };
}

// School Payments List Response
export interface SchoolPaymentsResponse {
  payments: Array<{
    id: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    receipt?: string;
    createdAt: string;
    paidAt?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Receipt Download Response
export interface ReceiptDownloadResponse {
  receiptNumber: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
}

// Error Response
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// Webhook Event Types
export interface WebhookEventPayload {
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

// Internal Service Types
export interface SchoolServiceResponse {
  success: boolean;
  data?: {
    school: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      status: string;
    };
  };
  error?: string;
}

// Database Entity Extensions (for API responses)
export interface ExtendedSchoolPayment {
  id: string;
  schoolId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: string;
  failureReason?: string;
  receipt?: string;
  notes?: Record<string, any>;
  paymentMethod?: string;
  paymentMethodDetails?: Record<string, any>;
  attempts: number;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  receiptLogs?: ExtendedReceiptLog[];
}

export interface ExtendedReceiptLog {
  id: string;
  schoolPaymentId: string;
  receiptNumber: string;
  receiptType: string;
  filePath: string;
  fileUrl?: string;
  fileSize?: number;
  generatedAt: Date;
  emailSent: boolean;
  emailSentAt?: Date;
  downloadCount: number;
  lastDownloadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Configuration Types
export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export interface PDFConfig {
  storagePath: string;
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
}

// Utility Types
export type PaymentStatusType = 'CREATED' | 'ATTEMPTED' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIAL_REFUND';
export type ReceiptType = 'PAYMENT_RECEIPT' | 'REFUND_RECEIPT' | 'CANCELLATION_RECEIPT';
