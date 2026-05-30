import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@edutech/api-client';
import type {
  CreateOrderResponse,
  VerifyPaymentResponse,
  PaymentHistory,
  PaymentFilters,
} from '@/types/payments';

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (courseId: number): Promise<CreateOrderResponse> => {
      return paymentsService.createOrder(courseId);
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }): Promise<VerifyPaymentResponse> => {
      return paymentsService.verifyPayment(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
  });
}

export function usePaymentHistory(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', 'history', filters],
    queryFn: async (): Promise<PaymentHistory> => {
      const result = await (paymentsService.getHistory(filters) as Promise<PaymentHistory & { payments?: unknown[] }>);
      if (result && typeof result === 'object' && 'payments' in result && Array.isArray(result.payments)) {
        return result as PaymentHistory;
      }
      return { payments: [], total: 0, page: 1, limit: 10 } as PaymentHistory;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function usePayment(paymentId: number | null) {
  return useQuery({
    queryKey: ['payments', paymentId],
    queryFn: async () => {
      return paymentsService.getById(paymentId!);
    },
    enabled: !!paymentId,
  });
}