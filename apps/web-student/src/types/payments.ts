import type {
  Payment,
  PaymentHistory,
  PaymentFilters,
  PaymentStatus,
  CreateOrderResponse,
  VerifyPaymentResponse,
} from '@edutech/types';

export type {
  Payment,
  PaymentHistory,
  PaymentFilters,
  PaymentStatus,
  CreateOrderResponse,
  VerifyPaymentResponse,
};

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayResponse) => void;
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}