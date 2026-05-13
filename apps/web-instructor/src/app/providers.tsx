'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { Toaster } from '@edutech/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <ToastProvider>
          {children}
          <ToasterClient />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function ToasterClient() {
  const { toasts, removeToast } = useToast();
  return <Toaster toasts={toasts} onDismiss={removeToast} />;
}
