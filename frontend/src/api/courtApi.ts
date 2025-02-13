import axiosInstance from './axiosConfig';
import { CourtDTO, CreateCourtDTO, UpdateCourtDTO } from '../types/dtos';

// Create axios instance with default config
const api = axiosInstance;

const AUTH_TOKEN_KEY = 'authToken';

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const courtApi = {
  // Get all courts
  getAllCourts: async () => {
    const response = await api.get<CourtDTO[]>('/api/Courts');
    return response;
  },

  // Get available courts
  getAvailableCourts: async () => {
    const response = await api.get<CourtDTO[]>('/api/Courts/available');
    return response;
  },

  // Get court by id
  getCourt: async (id: string) => {
    const response = await api.get<CourtDTO>(`/api/Courts/${id}`);
    return response;
  },

  // Create court (Admin only)
  createCourt: async (courtData: CreateCourtDTO) => {
    const response = await api.post<CourtDTO>('/api/Courts', courtData);
    return response;
  },

  // Update court (Admin only)
  updateCourt: async (id: string, courtData: UpdateCourtDTO) => {
    const response = await api.put<CourtDTO>(`/api/Courts/${id}`, courtData);
    return response;
  },

  // Delete court (Admin only)
  deleteCourt: async (id: string) => {
    const response = await api.delete(`/api/Courts/${id}`);
    return response;
  },

  // Get court availability
  getCourtAvailability: async (courtId: string, date: string) => {
    const response = await api.get<boolean>(`/api/Courts/${courtId}/availability`, {
      params: { date },
    });
    return response;
  },

  // Set court maintenance
  setCourtMaintenance: async (courtId: string, data: { startTime: string; endTime: string; notes?: string }) => {
    const response = await api.post(`/api/Courts/${courtId}/maintenance`, data);
    return response;
  },

  // Get court maintenance schedule
  getCourtMaintenance: async (courtId: string, startDate?: string, endDate?: string) => {
    const response = await api.get(`/api/Courts/${courtId}/maintenance`, {
      params: { startDate, endDate },
    });
    return response;
  },

  // Update court status
  updateCourtStatus: async (courtId: string, isAvailable: boolean) => {
    const response = await api.patch(`/api/Courts/${courtId}/status`, { isAvailable });
    return response;
  },

  // Get court usage statistics
  getCourtStats: async (courtId: string, startDate?: string, endDate?: string) => {
    const response = await api.get(`/api/Courts/${courtId}/stats`, {
      params: { startDate, endDate },
    });
    return response;
  },
};
