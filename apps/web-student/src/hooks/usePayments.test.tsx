import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCreateOrder,
  useVerifyPayment,
  usePaymentHistory,
  usePayment,
} from '@/hooks/usePayments';
import { paymentsService } from '@edutech/api-client';

vi.mock('@edutech/api-client', () => ({
  paymentsService: {
    createOrder: vi.fn(),
    verifyPayment: vi.fn(),
    getHistory: vi.fn(),
    getById: vi.fn(),
  },
}));

const mockCreateOrder = vi.mocked(paymentsService.createOrder);
const mockVerifyPayment = vi.mocked(paymentsService.verifyPayment);
const mockGetHistory = vi.mocked(paymentsService.getHistory);
const mockGetById = vi.mocked(paymentsService.getById);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCreateOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls paymentsService.createOrder with courseId on mutation', async () => {
    mockCreateOrder.mockResolvedValue({
      orderId: 'order_123',
      amount: 199900,
      currency: 'INR',
      key: 'rzp_test',
      receipt: 'receipt_1',
      paymentRecordId: 42,
    });

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockCreateOrder).toHaveBeenCalledWith(1);
    expect(result.current.data).toEqual({
      orderId: 'order_123',
      amount: 199900,
      currency: 'INR',
      key: 'rzp_test',
      receipt: 'receipt_1',
      paymentRecordId: 42,
    });
  });

  it('handles createOrder failure', async () => {
    mockCreateOrder.mockRejectedValue({
      response: { data: { message: 'Already enrolled' } },
    });

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useVerifyPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates payments, enrollments, and course queries on success', async () => {
    mockVerifyPayment.mockResolvedValue({
      success: true,
      enrollmentId: 99,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useVerifyPayment(), { wrapper });

    result.current.mutate({
      razorpayOrderId: 'o1',
      razorpayPaymentId: 'p1',
      razorpaySignature: 'sig',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['payments'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['enrollments'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['course'] });
  });

  it('returns enrollmentId on successful verification', async () => {
    mockVerifyPayment.mockResolvedValue({
      success: true,
      enrollmentId: 42,
    });

    const { result } = renderHook(() => useVerifyPayment(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      razorpayOrderId: 'o1',
      razorpayPaymentId: 'p1',
      razorpaySignature: 'sig',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.enrollmentId).toBe(42);
  });

  it('does not invalidate queries on verification failure', async () => {
    mockVerifyPayment.mockRejectedValue({
      response: { data: { message: 'Invalid signature' } },
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useVerifyPayment(), { wrapper });

    result.current.mutate({
      razorpayOrderId: 'o1',
      razorpayPaymentId: 'p1',
      razorpaySignature: 'bad',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('usePaymentHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches payment history with filters', async () => {
    const mockHistory = {
      payments: [{ id: 1, amount: 500, status: 'paid' }],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockGetHistory.mockResolvedValue(mockHistory);

    const { result } = renderHook(
      () => usePaymentHistory({ status: 'paid', page: 1, limit: 10 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetHistory).toHaveBeenCalledWith({
      status: 'paid',
      page: 1,
      limit: 10,
    });
    expect(result.current.data).toEqual(mockHistory);
  });

  it('returns empty fallback when service returns unexpected shape', async () => {
    mockGetHistory.mockResolvedValue(null as any);

    const { result } = renderHook(() => usePaymentHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      payments: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  });
});

describe('usePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches payment by id when paymentId is provided', async () => {
    mockGetById.mockResolvedValue({ id: 1, amount: 500, status: 'paid' });

    const { result } = renderHook(() => usePayment(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetById).toHaveBeenCalledWith(1);
    expect(result.current.data).toEqual({ id: 1, amount: 500, status: 'paid' });
  });

  it('does not fetch when paymentId is null', async () => {
    const { result } = renderHook(() => usePayment(null), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isFetching).toBe(false);
    expect(mockGetById).not.toHaveBeenCalled();
  });

  it('handles 404 error for non-existent payment', async () => {
    mockGetById.mockRejectedValue({
      response: { status: 404, data: { message: 'Not found' } },
    });

    const { result } = renderHook(() => usePayment(999), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
