import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '@edutech/types';

// ─── API Client Configuration ─────────────────────────────────────────────────

export interface ApiClientConfig {
  baseURL: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

// ─── Custom API Error ─────────────────────────────────────────────────────────

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: Array<{ field: string; message: string }>;

  constructor(error: ApiErrorResponse, status: number) {
    super(error.error.message);
    this.name = 'ApiClientError';
    this.code = error.error.code;
    this.status = status;
    this.details = error.error.details;
  }
}

// ─── API Client Class ─────────────────────────────────────────────────────────

export class ApiClient {
  private client: AxiosInstance;
  private getToken?: () => string | null;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.getToken = config.getToken;
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
    // Request interceptor: attach JWT token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: unwrap envelope, handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          this.onUnauthorized?.();
        }

        if (error.response?.data) {
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

  // ─── HTTP Methods ───────────────────────────────────────────────────────

  async get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params, ...config });
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

// ─── Provider ───────────────────────────────────────────────────────────────

export { ApiProvider } from './provider';
