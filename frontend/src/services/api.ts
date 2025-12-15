/**
 * API Client Service
 * Configuração centralizada de requisições HTTP para o backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.instance.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratamento de erros
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token inválido - fazer logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        }
        throw error;
      }
    );
  }

  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<T>(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch<T>(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse<any> {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message,
          code: error.code,
          status: error.response?.status,
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Unknown error occurred',
      },
    };
  }
}

export const apiClient = new ApiClient();

// Endpoints específicos do StreamPay

export const streamsApi = {
  list: () => apiClient.get('/streams'),
  get: (id: string) => apiClient.get(`/streams/${id}`),
  create: (data: any) => apiClient.post('/streams', data),
  claim: (id: string) => apiClient.post(`/streams/${id}/claim`, {}),
  pause: (id: string) => apiClient.patch(`/streams/${id}/pause`, {}),
  cancel: (id: string) => apiClient.delete(`/streams/${id}`),
};

export const poolsApi = {
  list: () => apiClient.get('/pools'),
  get: (id: string) => apiClient.get(`/pools/${id}`),
  create: (data: any) => apiClient.post('/pools', data),
  addLiquidity: (id: string, data: any) => apiClient.post(`/pools/${id}/add-liquidity`, data),
  removeLiquidity: (id: string, data: any) => apiClient.post(`/pools/${id}/remove-liquidity`, data),
};

export const authApi = {
  login: (address: string, signature: string) =>
    apiClient.post('/auth/login', { address, signature }),
  logout: () => apiClient.post('/auth/logout', {}),
  verify: () => apiClient.get('/auth/verify'),
};

export const balanceApi = {
  get: (address: string) => apiClient.get(`/balance/${address}`),
  tokens: (address: string) => apiClient.get(`/balance/${address}/tokens`),
};

export const priceApi = {
  get: (symbol: string) => apiClient.get(`/price/${symbol}`),
  getMultiple: (symbols: string[]) =>
    apiClient.get('/prices', { params: { symbols: symbols.join(',') } }),
};
