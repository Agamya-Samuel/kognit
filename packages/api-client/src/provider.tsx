'use client';

import { useEffect } from 'react';
import { initApiClient } from './index';

const TOKEN_KEY = 'accessToken';

interface ApiProviderProps {
  children: React.ReactNode;
  loginPath?: string;
}

export function ApiProvider({ children, loginPath = '/auth/login' }: ApiProviderProps) {
  // Initialize API client on client side to avoid useEffect timing issues
  if (typeof window !== 'undefined') {
    initApiClient({
      baseURL: process.env.NEXT_PUBLIC_API_URL!,
      getToken: () => typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
      getRefreshToken: () => typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
      onTokenRefreshed: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
      },
      onUnauthorized: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('refreshToken');
          window.location.href = loginPath;
        }
      },
    });
  }

  useEffect(() => {
    // Re-initialize if loginPath changes (though this is uncommon)
    if (typeof window !== 'undefined') {
      initApiClient({
        baseURL: process.env.NEXT_PUBLIC_API_URL!,
        getToken: () => typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
        getRefreshToken: () => typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
        onTokenRefreshed: (accessToken, refreshToken) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, accessToken);
            localStorage.setItem('refreshToken', refreshToken);
          }
        },
        onUnauthorized: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('refreshToken');
            window.location.href = loginPath;
          }
        },
      });
    }
  }, [loginPath]);

  return <>{children}</>;
}