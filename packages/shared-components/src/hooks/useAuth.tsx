'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '@edutech/api-client';
import type { LoginResponse } from '@edutech/api-client';
import { isApiError } from '@edutech/api-client';

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTH_ERROR',
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isVerified: boolean;
  approvalStatus?: string;
  onboardingCompleted?: boolean;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, portal?: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshTokens: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      fetchProfile();
    } else {
      setIsLoading(false);
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await authService.getMe();
      if (mountedRef.current) {
        setUser(profile as unknown as User);
        setIsLoading(false);
      }
    } catch {
      if (!mountedRef.current) return;
      clearAuth();
      setIsLoading(false);
    }
  }, [clearAuth]);

  const login = async (email: string, password: string, portal?: string) => {
    try {
      const response = await authService.login(email, password, portal);
      const authResponse = response as unknown as LoginResponse;

      localStorage.setItem('accessToken', authResponse.tokens.accessToken);
      localStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
      setAccessToken(authResponse.tokens.accessToken);
      setRefreshToken(authResponse.tokens.refreshToken);
      setUser(authResponse.user as unknown as User);
    } catch (error: unknown) {
      if (isApiError(error)) {
        throw new AuthError(error.message, 'LOGIN_FAILED', error.status);
      }
      throw new AuthError('Network error. Please check your connection.', 'NETWORK_ERROR');
    }
  };

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const setTokens = useCallback(
    (access: string, refresh: string) => {
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setAccessToken(access);
      setRefreshToken(refresh);
      fetchProfile();
    },
    [fetchProfile]
  );

  const refreshTokens = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedRefreshToken) {
      try {
        const response = await authService.refreshToken(storedRefreshToken);
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        await fetchProfile();
      } catch {
        clearAuth();
        throw new AuthError('Session expired. Please login again.', 'TOKEN_EXPIRED', 401);
      }
    } else {
      clearAuth();
      throw new AuthError('No session found. Please login.', 'NO_SESSION');
    }
  }, [fetchProfile, clearAuth]);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    login,
    logout,
    setTokens,
    refreshTokens,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
