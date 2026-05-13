import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  CreateOrderResponse,
  VerifyPaymentResponse,
  PaymentHistoryResponse,
  PaymentFilters,
} from '@/types/payments';

/**
 * Create a Razorpay order for a course
 */
export function useCreateOrder() {
  return useMutation({
    mutationFn: async (courseId: number): Promise<CreateOrderResponse> => {
      const { data } = await api.post<{ success: boolean; data: CreateOrderResponse }>(
        '/payments/create-order',
        { courseId },
      );
      return data.data;
    },
  });
}

/**
 * Verify payment and complete enrollment
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }): Promise<VerifyPaymentResponse> => {
      const { data } = await api.post<{ success: boolean; data: VerifyPaymentResponse }>(
        '/payments/verify',
        params,
      );
      return data.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries after successful payment
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
  });
}

/**
 * Get payment history for the current student
 */
export function usePaymentHistory(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', 'history', filters],
    queryFn: async (): Promise<PaymentHistoryResponse> => {
      const params = new URLSearchParams();
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.status) params.set('status', filters.status);
      if (filters?.courseId) params.set('courseId', String(filters.courseId));

      const { data } = await api.get<{
        success: boolean;
        data: PaymentHistoryResponse['payments'];
        meta: { page: number; limit: number; total: number };
      }>(`/payments/history?${params.toString()}`);

      return {
        payments: data.data,
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get a single payment by ID
 */
export function usePayment(paymentId: number | null) {
  return useQuery({
    queryKey: ['payments', paymentId],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: any }>(
        `/payments/${paymentId}`,
      );
      return data.data;
    },
    enabled: !!paymentId,
  });
}
