'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: () => void;
}

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  onClose,
}: ToastProps) {
  return (
    <div
      key={id}
      className={cn(
        'pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all',
        {
          'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800':
            variant === 'default',
          'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800':
            variant === 'destructive',
          'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800':
            variant === 'success',
        },
      )}
      role="alert"
    >
      <div className="grid gap-1">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </div>
        {description && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={() => onClose()}
          className="absolute right-2 top-2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

export type ToastActionElement = React.ReactElement;
