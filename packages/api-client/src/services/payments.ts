import { getApiClient } from '../index';
import type { CreateOrderResponse, VerifyPaymentResponse, PaymentHistory, PaymentFilters, PaginationQuery } from '@edutech/types';

export const paymentsService = {
  async createOrder(courseId: number) {
    return getApiClient().post<CreateOrderResponse>('/payments/create-order', { courseId });
  },

  async verifyPayment(params: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return getApiClient().post<VerifyPaymentResponse>('/payments/verify', params);
  },

  async getHistory(filters?: PaymentFilters & PaginationQuery) {
    return getApiClient().get<PaymentHistory>('/payments/history', filters);
  },

  async getById(paymentId: number) {
    return getApiClient().get<any>(`/payments/${paymentId}`);
  },
};