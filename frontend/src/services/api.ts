import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7021/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const courtApi = {
  getCourts: () => api.get('/courts'),
  getCourtById: (id: number) => api.get(`/courts/${id}`),
  getCourtAvailability: (courtId: number, date: string) => 
    api.get(`/courts/${courtId}/availability`, { params: { date } }),
};

export const bookingApi = {
  createBooking: (data: {
    courtId: number;
    startTime: string;
    endTime: string;
    userId: string;
  }) => api.post('/bookings', data),
  getBookings: () => api.get('/bookings'),
  getBookingById: (id: number) => api.get(`/bookings/${id}`),
  cancelBooking: (id: number) => api.delete(`/bookings/${id}`),
};

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/current-user'),
};

export const membershipApi = {
  getUserMembership: () => api.get('/memberships/user'),
  getMembershipTypes: () => api.get('/memberships/types'),
  createMembership: (data: {
    userId: string;
    membershipTypeId: number;
    startDate: string;
  }) => api.post('/memberships', data),
};

export const messageApi = {
  getUserMessages: () => api.get('/messages'),
  getMessage: (id: number) => api.get(`/messages/${id}`),
  markAsRead: (id: number) => api.put(`/messages/${id}/read`),
  deleteMessage: (id: number) => api.delete(`/messages/${id}`),
};

export default api;
