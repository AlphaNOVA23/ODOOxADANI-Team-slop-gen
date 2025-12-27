import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface WorkCenterResponse {
  id: number
  name: string
  code: string
  tag?: string | null
  alternative_workcenters: string[]
  cost_per_hour?: number | null
  capacity_time_efficiency?: number | null
  oee_target?: number | null
  status?: string | null
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
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
          }
          // You could redirect to login page here
        }

        return Promise.reject(error);
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
      const response = await this.axiosInstance.get<T>(endpoint);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      const err = error as AxiosError<any>;
      return {
        error: err.response?.data?.detail || err.message || 'Request failed',
        status: err.response?.status || 0,
      };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, body);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      const err = error as AxiosError<any>;
      return {
        error: err.response?.data?.detail || err.message || 'Request failed',
        status: err.response?.status || 0,
      };
    }
  }

  async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(endpoint, body);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      const err = error as AxiosError<any>;
      return {
        error: err.response?.data?.detail || err.message || 'Request failed',
        status: err.response?.status || 0,
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      const err = error as AxiosError<any>;
      return {
        error: err.response?.data?.detail || err.message || 'Request failed',
        status: err.response?.status || 0,
      };
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
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
  team_id?: number | null;
}

export interface TeamResponse {
  id: number
  name: string
  description?: string | null
}

export interface TeamWithMembersResponse extends TeamResponse {
  members: User[]
}

export interface EquipmentResponse {
  id: number
  name: string
  serial_number: string
  category?: string | null
  purchase_date?: string | null
  warranty_start_date?: string | null
  warranty_end_date?: string | null
  warranty_info?: string | null
  location?: string | null
  department?: string | null
  employee_owner?: string | null
  is_active: boolean
  maintenance_team_id: number
  default_technician_id?: number | null
  open_requests_count: number
}

export interface MaintenanceRequestResponse {
  id: number
  subject: string
  description?: string | null
  request_type: "Corrective" | "Preventive"
  priority?: string | null
  equipment_id: number
  scheduled_date?: string | null
  stage: "New" | "In Progress" | "Repaired" | "Scrap"
  maintenance_team_id: number
  technician_id?: number | null
  created_date?: string | null
  completed_date?: string | null
  duration: number
  notes?: string | null
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
  listEquipment: () =>
    apiClient.get<EquipmentResponse[]>("/equipment"),
  createEquipment: (payload: any) =>
    apiClient.post<EquipmentResponse>("/equipment", payload),
};

export const requestsApi = {
  createRequest: (requestData: any) =>
    apiClient.post<any>('/requests/', requestData),
  
  updateRequest: (id: number, updateData: any) =>
    apiClient.patch<any>(`/requests/${id}`, updateData),

  listRequests: () =>
    apiClient.get<MaintenanceRequestResponse[]>("/requests"),

  getRequest: (id: number) =>
    apiClient.get<MaintenanceRequestResponse>(`/requests/${id}`),
};

export const teamsApi = {
  listTeams: () => apiClient.get<TeamResponse[]>("/teams"),
  listTeamsWithMembers: () => apiClient.get<TeamWithMembersResponse[]>("/teams/with-members"),
}

export const techniciansApi = {
  listTechnicians: () => apiClient.get<User[]>("/technicians"),
}

export const workcentersApi = {
  listWorkCenters: () => apiClient.get<WorkCenterResponse[]>("/workcenters"),
  createWorkCenter: (payload: any) => apiClient.post<WorkCenterResponse>("/workcenters", payload),
}
