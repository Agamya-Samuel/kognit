import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutButton } from '@/components/CheckoutButton';
import { paymentsService } from '@edutech/api-client';

vi.mock('@edutech/api-client', () => ({
  paymentsService: {
    createOrder: vi.fn(),
    verifyPayment: vi.fn(),
  },
}));

const mockCreateOrder = vi.mocked(paymentsService.createOrder);
const mockVerifyPayment = vi.mocked(paymentsService.verifyPayment);

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('CheckoutButton', () => {
  let mockRazorpayOpen: ReturnType<typeof vi.fn>;
  let mockRazorpayInstance: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRazorpayOpen = vi.fn();
    mockRazorpayInstance = { open: mockRazorpayOpen };

    function RazorpayMock(this: any) {
      return mockRazorpayInstance;
    }
    (window as any).Razorpay = RazorpayMock;
  });

  afterEach(() => {
    delete (window as any).Razorpay;
  });

  it('renders the button with formatted price', () => {
    renderWithProviders(
      <CheckoutButton
        courseId={1}
        courseTitle="React Masterclass"
        priceInr={1999}
      />,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Enroll Now — ₹1999');
  });

  it('calls paymentsService.createOrder when button is clicked', async () => {
    mockCreateOrder.mockResolvedValue({
      orderId: 'order_abc',
      amount: 199900,
      currency: 'INR',
      key: 'rzp_test_key',
      receipt: 'receipt_1',
      paymentRecordId: 10,
    });

    renderWithProviders(
      <CheckoutButton
        courseId={1}
        courseTitle="React Masterclass"
        priceInr={1999}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith(1);
    });
  });

  it('initializes Razorpay with order details when script is already loaded', async () => {
    mockCreateOrder.mockResolvedValue({
      orderId: 'order_xyz',
      amount: 50000,
      currency: 'INR',
      key: 'rzp_test_key_2',
      receipt: 'receipt_2',
      paymentRecordId: 20,
    });

    const openSpy = vi.fn();
    function RazorpayMockInline(this: any) {
      return { open: openSpy };
    }
    (window as any).Razorpay = RazorpayMockInline;

    const onError = vi.fn();

    renderWithProviders(
      <CheckoutButton
        courseId={2}
        courseTitle="Advanced React"
        priceInr={500}
        onError={onError}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(
      () => {
        expect(mockCreateOrder).toHaveBeenCalledWith(2);
      },
      { timeout: 5000 },
    );

    await waitFor(
      () => {
        expect(openSpy).toHaveBeenCalled();
      },
      { timeout: 8000 },
    );
  });

  it('calls onError when createOrder fails', async () => {
    mockCreateOrder.mockRejectedValue({
      response: { data: { error: 'Course not found' } },
    });

    const onError = vi.fn();

    renderWithProviders(
      <CheckoutButton
        courseId={999}
        courseTitle="Missing Course"
        priceInr={1999}
        onError={onError}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Course not found');
    });
  });

  it('disables button while processing', async () => {
    let resolveOrder: (value: any) => void;
    mockCreateOrder.mockReturnValue(
      new Promise((resolve) => {
        resolveOrder = resolve;
      }),
    );

    renderWithProviders(
      <CheckoutButton
        courseId={1}
        courseTitle="React Masterclass"
        priceInr={1999}
      />,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    resolveOrder!({
      orderId: 'order_abc',
      amount: 199900,
      currency: 'INR',
      key: 'rzp_test_key',
      receipt: 'receipt_1',
      paymentRecordId: 10,
    });
  });
});
