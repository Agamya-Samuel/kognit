'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Custom error class for auth-specific errors
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
      fetchProfile(storedAccessToken);
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

  const fetchProfile = useCallback(async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (mountedRef.current) {
        setUser(response.data);
        setIsLoading(false);
      }
    } catch (error: any) {
      if (!mountedRef.current) return;
      
      if (error.response?.status === 401) {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
              refreshToken: storedRefreshToken,
            });
            const { data } = refreshResponse.data;
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (mountedRef.current) {
              setAccessToken(data.accessToken);
              setRefreshToken(data.refreshToken);
              fetchProfile(data.accessToken);
            }
            return;
          } catch {
            if (mountedRef.current) {
              clearAuth();
            }
          }
        } else {
          clearAuth();
        }
      } else if (!mountedRef.current) {
        clearAuth();
      }
      setIsLoading(false);
    }
  }, [clearAuth]);

  const login = async (email: string, password: string, portal?: string) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password, portal });
      const { user: authUser, tokens } = response.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      setUser(authUser);
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data?.error?.message || 'Login failed';
        throw new AuthError(message, 'LOGIN_FAILED', error.response.status);
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
      fetchProfile(access);
    },
    [fetchProfile]
  );

  const refreshTokens = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedRefreshToken) {
      try {
        const response = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken: storedRefreshToken,
        });
        const { data } = response.data;
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        await fetchProfile(data.accessToken);
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
