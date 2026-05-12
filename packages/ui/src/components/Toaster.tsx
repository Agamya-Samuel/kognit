'use client';

import { Toast } from './Toast';

interface ToasterProps {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
  }>;
  onDismiss: (id: string) => void;
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className="fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onClose={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}
