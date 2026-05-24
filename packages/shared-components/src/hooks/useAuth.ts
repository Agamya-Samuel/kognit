'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      fetchProfile(storedAccessToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedRefreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken: storedRefreshToken,
          });
          const { data } = refreshResponse.data;
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken);
          fetchProfile(data.accessToken);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setAccessToken(null);
          setRefreshToken(null);
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    const { user: authUser, tokens } = response.data;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUser(authUser);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const setTokens = useCallback(
    (access: string, refresh: string) => {
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setAccessToken(access);
      setRefreshToken(refresh);
      fetchProfile(access);
    },
    [fetchProfile],
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        throw new Error('Failed to refresh token');
      }
    } else {
      throw new Error('No refresh token available');
    }
  }, [fetchProfile]);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    logout,
    setTokens,
    refreshTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
