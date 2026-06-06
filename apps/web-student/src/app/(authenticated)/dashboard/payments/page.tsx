'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentHistory } from '@/hooks/usePayments';
import { CreditCard } from 'lucide-react';
import { EmptyState, ErrorState, StatusBadge } from '@edutech/shared-components';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground mt-1">View and manage your payment transactions</p>
      </div>

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
                ? 'bg-foreground text-background'
                : 'bg-card text-muted-foreground hover:bg-accent border'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="mb-2 h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <ErrorState
          message="Failed to load payment history"
          onRetry={() => refetch()}
        />
      )}

      {data && data.payments.length === 0 && (
        <EmptyState
          title="No payments yet"
          description="Your payment transactions will appear here once you purchase a course."
          icon={<CreditCard className="h-12 w-12 text-muted-foreground" />}
          action={{
            label: "Browse Courses",
            onClick: () => router.push('/courses')
          }}
        />
      )}

      {data && data.payments.length > 0 && (
        <>
          <div className="space-y-3">
            {data.payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 flex-shrink-0">
                    <StatusBadge status={payment.status} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="truncate font-medium text-foreground">
                        Course #{payment.courseId}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Order: {payment.razorpayOrderId}</span>
                      {payment.razorpayPaymentId && (
                        <>
                          <span>&middot;</span>
                          <span>Payment: {payment.razorpayPaymentId}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDate(payment.createdAt)}</span>
                      <span className="font-medium text-foreground">
                        {payment.currency} {formatAmount(payment.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {formatAmount(payment.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.total > limit && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(data.total / limit)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= data.total}
                className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
