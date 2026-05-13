'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentHistory } from '@/hooks/usePayments';
import { ArrowRight, CreditCard, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700',
    dotColor: 'bg-yellow-500',
  },
  paid: {
    label: 'Paid',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700',
    dotColor: 'bg-green-500',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    color: 'bg-red-100 text-red-700',
    dotColor: 'bg-red-500',
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    color: 'bg-gray-100 text-gray-700',
    dotColor: 'bg-gray-500',
  },
} as const;

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const limit = 10;

  const { data, isLoading, error, refetch } = usePaymentHistory({
    page,
    limit,
    status: statusFilter,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="mt-1 text-gray-500">View and manage your payment transactions</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {['all', 'paid', 'pending', 'failed', 'refunded'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status === 'all' ? undefined : status);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                (status === 'all' ? !statusFilter : statusFilter === status)
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border bg-white p-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="mb-4 text-red-500">Failed to load payment history</p>
            <button
              onClick={() => refetch()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-500"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {data && data.payments.length === 0 && (
          <div className="rounded-lg border bg-white p-12 text-center">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No payments yet</h3>
            <p className="mb-6 text-gray-500">
              Your payment transactions will appear here once you purchase a course.
            </p>
            <button
              onClick={() => router.push('/courses')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-500"
            >
              Browse Courses
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Payment List */}
        {data && data.payments.length > 0 && (
          <>
            <div className="space-y-3">
              {data.payments.map((payment) => {
                const config = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={payment.id}
                    className="rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.color}`}
                      >
                        <StatusIcon size={20} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="truncate font-medium text-gray-900">
                            Course #{payment.courseId}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
                            {config.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Order: {payment.razorpayOrderId}</span>
                          {payment.razorpayPaymentId && (
                            <>
                              <span>&middot;</span>
                              <span>Payment: {payment.razorpayPaymentId}</span>
                            </>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                          <span>{formatDate(payment.createdAt)}</span>
                          <span className="font-medium text-gray-600">
                            {payment.currency} {formatAmount(payment.amount)}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatAmount(payment.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {data.total > limit && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {Math.ceil(data.total / limit)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page * limit >= data.total}
                  className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
