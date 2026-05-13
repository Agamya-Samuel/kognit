'use client';

import { useState, useCallback } from 'react';
import { useCreateOrder, useVerifyPayment } from '@/hooks/usePayments';
import type { RazorpayOptions, RazorpayResponse } from '@/types/payments';

interface CheckoutButtonProps {
  courseId: number;
  courseTitle: string;
  priceInr: number;
  onSuccess?: (enrollmentId: number) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export function CheckoutButton({
  courseId,
  courseTitle,
  priceInr,
  onSuccess,
  onError,
  className,
  disabled = false,
}: CheckoutButtonProps) {
  const [isOpening, setIsOpening] = useState(false);
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const handleCheckout = useCallback(async () => {
    try {
      setIsOpening(true);

      // Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        onError?.('Failed to load payment gateway. Please try again.');
        setIsOpening(false);
        return;
      }

      // Create order on backend
      const order = await createOrder.mutateAsync(courseId);

      // Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: order.key,
        amount: order.amount * 100, // amount is in paise from backend (already in paise)
        currency: order.currency,
        name: 'EduTech',
        description: `Purchase: ${courseTitle}`,
        order_id: order.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const result = await verifyPayment.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (result.success) {
              onSuccess?.(result.enrollmentId);
            }
          } catch (err: any) {
            onError?.(err.response?.data?.error || 'Payment verification failed');
          } finally {
            setIsOpening(false);
          }
        },
        prefill: {},
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            setIsOpening(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      onError?.(err.response?.data?.error || 'Failed to initiate payment');
      setIsOpening(false);
    }
  }, [courseId, courseTitle, createOrder, verifyPayment, loadRazorpayScript, onSuccess, onError]);

  const isLoading = isOpening || createOrder.isPending || verifyPayment.isPending;

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={
        className ||
        'w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
      }
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        `Enroll Now — ₹${priceInr}`
      )}
    </button>
  );
}
