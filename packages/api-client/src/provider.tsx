'use client';

import { useEffect } from 'react';
import { initApiClient } from './index';

const TOKEN_KEY = 'accessToken';

interface ApiProviderProps {
  children: React.ReactNode;
  loginPath?: string;
}

export function ApiProvider({ children, loginPath = '/auth/login' }: ApiProviderProps) {
  useEffect(() => {
    initApiClient({
      baseURL: process.env.NEXT_PUBLIC_API_URL!,
      getToken: () => typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
      onUnauthorized: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('refreshToken');
          window.location.href = loginPath;
        }
      },
    });
  }, [loginPath]);

  return <>{children}</>;
}