import { getApiClient } from '../index';

export const authService = {
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