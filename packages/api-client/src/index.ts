import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '@edutech/types';

// ─── API Client Configuration ─────────────────────────────────────────────────

export interface ApiClientConfig {
  baseURL: string;
  getToken?: () => string | null;
  getRefreshToken?: () => string | null;
  onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;
  onUnauthorized?: () => void;
}

// ─── Custom API Error ─────────────────────────────────────────────────────────

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: Array<{ field: string; message: string }>;

  constructor(error: unknown, status: number) {
    let errorObj: Partial<ApiErrorResponse>;
    if (error && typeof error === 'object' && error !== null) {
      errorObj = error as Partial<ApiErrorResponse>;
    } else if (error instanceof Error) {
      errorObj = { success: false, data: null, error: { code: 'UNKNOWN_ERROR', message: error.message } };
    } else {
      errorObj = {};
    }
    let errorData: unknown;
    try {
      errorData = errorObj?.error ?? errorObj?.data;
    } catch {
      errorData = null;
    }
    const message = (errorData && typeof errorData === 'object' && 'message' in errorData && typeof (errorData as { message: unknown }).message === 'string')
      ? (errorData as { message: string }).message
      : 'An unexpected error occurred';
    super(message);
    this.name = 'ApiClientError';
    this.code = (errorData && typeof errorData === 'object' && 'code' in errorData && typeof (errorData as { code: unknown }).code === 'string')
      ? (errorData as { code: string }).code
      : 'UNKNOWN_ERROR';
    this.status = status;
    this.details = (errorData && typeof errorData === 'object' && 'details' in errorData)
      ? (errorData as { details: Array<{ field: string; message: string }> }).details
      : undefined;
  }
}

// ─── API Client Class ─────────────────────────────────────────────────────────

export class ApiClient {
  private client: AxiosInstance;
  private getToken?: () => string | null;
  private getRefreshToken?: () => string | null;
  private onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;
  private onUnauthorized?: () => void;
  private refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

  constructor(config: ApiClientConfig) {
    this.getToken = config.getToken;
    this.getRefreshToken = config.getRefreshToken;
    this.onTokenRefreshed = config.onTokenRefreshed;
    this.onUnauthorized = config.onUnauthorized;

    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const token = this.getToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (!originalRequest) {
          throw new ApiClientError(
            {
              success: false,
              data: null,
              error: {
                code: 'REQUEST_ERROR',
                message: error.message || 'An unexpected error occurred',
              },
            },
            error.response?.status || 0,
          );
        }

        if (error.response?.status === 401) {
          const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

          if (!isRefreshEndpoint && this.getRefreshToken && this.onTokenRefreshed && !originalRequest._retry) {
            const refreshToken = this.getRefreshToken();

            if (refreshToken && !this.refreshPromise) {
              this.refreshPromise = this.performRefreshToken(refreshToken);

              try {
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.refreshPromise;

                this.onTokenRefreshed(newAccessToken, newRefreshToken);
                this.refreshPromise = null;

                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${newAccessToken}`,
                };
                originalRequest._retry = true;

                return this.client.request(originalRequest);
              } catch (refreshError) {
                this.refreshPromise = null;
                this.onUnauthorized?.();
                throw error;
              }
            } else if (!refreshToken || !this.getRefreshToken) {
              this.onUnauthorized?.();
            }
          } else {
            this.onUnauthorized?.();
          }

          if (error.response?.data && typeof error.response.data === 'object' && error.response.data !== null) {
            throw new ApiClientError(error.response.data, error.response.status);
          }

          throw new ApiClientError(
            {
              success: false,
              data: null,
              error: {
                code: 'NETWORK_ERROR',
                message: error.message || 'An unexpected error occurred',
              },
            },
            error.response?.status || 0,
          );
        }

        if (error.response?.data && typeof error.response.data === 'object' && error.response.data !== null) {
          throw new ApiClientError(error.response.data, error.response.status);
        }

        throw new ApiClientError(
          {
            success: false,
            data: null,
            error: {
              code: 'NETWORK_ERROR',
              message: error.message || 'An unexpected error occurred',
            },
          },
          error.response?.status || 0,
        );
      },
    );
  }

  private async performRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await axios.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      `${this.client.defaults.baseURL}/auth/refresh`,
      { refreshToken },
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error('Failed to refresh token');
  }

  // ─── HTTP Methods ───────────────────────────────────────────────────────

  async get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const safeParams = params && typeof params === 'object' && !Array.isArray(params) ? params : {};
    const response = await this.client.get<ApiResponse<T>>(url, { params: safeParams, ...config });
    return response.data.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // ─── Raw Access ─────────────────────────────────────────────────────────

  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let apiClient: ApiClient | null = null;

export function initApiClient(config: ApiClientConfig): ApiClient {
  apiClient = new ApiClient(config);
  return apiClient;
}

export function getApiClient(): ApiClient {
  if (!apiClient) {
    throw new Error('API client not initialized. Call initApiClient() first.');
  }
  return apiClient;
}

// ─── Server-side Factory ───────────────────────────────────────────────────────

export function createServerApiClient(baseURL: string, token?: string): ApiClient {
  return new ApiClient({
    baseURL,
    getToken: token ? () => token : undefined,
  });
}

// ─── Type Guards ──────────────────────────────────────────────────────────────

export function isApiError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

// ─── Service Modules ───────────────────────────────────────────────────────────

export * from './services/courses';
export * from './services/assignments';
export * from './services/payments';
export * from './services/chat';
export * from './services/certificates';
export * from './services/uploads';
export * from './services/live-classes';
export * from './services/progress';
export * from './services/admin';
export * from './services/auth';
export * from './services/schedule';
export * from './services/recordings';
export * from './services/users';
export * from './services/notifications';
export * from './services/enrollments';
export * from './services/analytics';

// ─── Hooks ───────────────────────────────────────────────────────────────

export * from './hooks/useEmailVerification';

// ─── Provider ───────────────────────────────────────────────────────────────

export { ApiProvider } from './provider';
