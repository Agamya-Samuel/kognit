import { getApiClient } from '../index';

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  async login(email: string, password: string) {
    return getApiClient().post<LoginResponse>('/auth/login', { email, password });
  },

  async requestVerificationCode(email: string) {
    return getApiClient().post<any>('/auth/register/request', { email });
  },

  async verifyCode(email: string, code: string) {
    return getApiClient().post<any>('/auth/register/verify', { email, code });
  },

  async completeRegistration(email: string, code: string, name: string, password: string) {
    return getApiClient().post<any>('/auth/register/complete', { email, code, name, password });
  },

  async forgotPassword(email: string) {
    return getApiClient().post<any>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string, confirmPassword: string) {
    return getApiClient().post<any>('/auth/reset-password', { token, password, confirmPassword });
  },
};