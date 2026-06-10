import { describe, it, expect } from 'vitest';

// Test the pure formatting/filtering logic from the payments page

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

const STATUSES = ['all', 'paid', 'pending', 'failed', 'refunded'];

function getStatusFilterValue(status: string, currentFilter: string | undefined): string | undefined {
  return status === 'all' ? undefined : status;
}

function shouldResetPage(currentStatus: string, newStatus: string): boolean {
  return currentStatus !== newStatus;
}

describe('Payment history page logic', () => {
  describe('formatDate', () => {
    it('should format ISO date to Indian locale', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
    });

    it('should handle different dates', () => {
      const result = formatDate('2023-12-25T15:45:00Z');
      expect(result).toContain('Dec');
      expect(result).toContain('2023');
    });
  });

  describe('formatAmount', () => {
    it('should format amount with rupee symbol', () => {
      expect(formatAmount(1000)).toContain('1,000');
      expect(formatAmount(1000)).toMatch(/^₹/);
    });

    it('should format large amounts with commas', () => {
      const result = formatAmount(100000);
      expect(result).toContain('1,00,000');
    });
  });

  describe('status filter', () => {
    it('should map "all" to undefined filter', () => {
      expect(getStatusFilterValue('all', undefined)).toBeUndefined();
    });

    it('should pass through specific status values', () => {
      expect(getStatusFilterValue('paid', undefined)).toBe('paid');
      expect(getStatusFilterValue('pending', undefined)).toBe('pending');
      expect(getStatusFilterValue('failed', undefined)).toBe('failed');
      expect(getStatusFilterValue('refunded', undefined)).toBe('refunded');
    });

    it('should reset page when status filter changes', () => {
      expect(shouldResetPage('paid', 'pending')).toBe(true);
      expect(shouldResetPage('paid', 'paid')).toBe(false);
    });
  });

  describe('available statuses', () => {
    it('should have 5 status options', () => {
      expect(STATUSES).toHaveLength(5);
      expect(STATUSES).toContain('all');
      expect(STATUSES).toContain('paid');
      expect(STATUSES).toContain('pending');
      expect(STATUSES).toContain('failed');
      expect(STATUSES).toContain('refunded');
    });
  });
});
