import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.loadToken();
    this.setupInterceptors();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  private setupInterceptors() {
    // Request interceptor to add token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return {
          data: response.data,
          status: response.status,
        };
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
          }
          // You could redirect to login page here
        }
        
        return {
          error: error.response?.data?.detail || error.message || 'Request failed',
          status: error.response?.status || 0,
        };
      }
    );
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get(endpoint);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post(endpoint, body);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch(endpoint, body);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete(endpoint);
      return response;
    } catch (error: any) {
      return error;
    }
  }
}

export const apiClient = new ApiClient();

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  password: string;
  name: string;
  avatar_url?: string;
  team_id?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  avatar_url?: string;
  team_id?: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<TokenResponse>('/login', credentials),
  
  signup: (userData: SignupData) =>
    apiClient.post<TokenResponse>('/signup', userData),
  
  getCurrentUser: () =>
    apiClient.get<User>('/users/me'),
};

export const equipmentApi = {
  getEquipment: (id: number) =>
    apiClient.get<any>(`/equipment/${id}`),
};

export const requestsApi = {
  createRequest: (requestData: any) =>
    apiClient.post<any>('/requests/', requestData),
  
  updateRequest: (id: number, updateData: any) =>
    apiClient.patch<any>(`/requests/${id}`, updateData),
};
