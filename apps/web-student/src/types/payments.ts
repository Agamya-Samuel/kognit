export interface Payment {
  id: number;
  studentId: number;
  courseId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  receipt: string;
  paymentRecordId: number;
}

export interface VerifyPaymentResponse {
  success: boolean;
  enrollmentId: number;
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  courseId?: number;
}

// Razorpay types for the checkout modal
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
