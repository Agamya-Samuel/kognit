'use client';

import { useEffect, useRef } from 'react';
import { initApiClient } from './index';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface ApiProviderProps {
  children: React.ReactNode;
  loginPath?: string;
}

function buildConfig(loginPath: string) {
  return {
    baseURL: process.env.NEXT_PUBLIC_API_URL!,
    getToken: () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
    getRefreshToken: () => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null),
    onTokenRefreshed: (accessToken: string, refreshToken: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    },
    onUnauthorized: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = loginPath;
      }
    },
  };
}

export function ApiProvider({ children, loginPath = '/auth/login' }: ApiProviderProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize once on mount; skip re-init caused by StrictMode double-invoke
    // or unrelated parent re-renders.
    if (typeof window === 'undefined' || initializedRef.current) return;
    initializedRef.current = true;
    initApiClient(buildConfig(loginPath));
  }, []);

  return <>{children}</>;
}
