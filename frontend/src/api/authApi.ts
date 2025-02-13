import axiosInstance from './axiosConfig';
import { LoginRequestDTO, RegisterRequestDTO, UserDTO } from '../types/dtos';

// Create axios instance with default config
const api = axiosInstance;

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  // Authentication
  login: (credentials: LoginRequestDTO) => 
    api.post<{ token: string; user: UserDTO }>('/Auth/login', credentials),

  register: (userData: RegisterRequestDTO) => {
    console.log('Making registration request to:', '/Auth/register');
    return api.post<{ token: string; user: UserDTO }>('/Auth/register', userData);
  },

  // User management
  getCurrentUser: () => 
    api.get<UserDTO>('/Auth/me'),

  // Token management
  refreshToken: () => 
    api.post<{ token: string }>('/Auth/refresh-token'),
};
