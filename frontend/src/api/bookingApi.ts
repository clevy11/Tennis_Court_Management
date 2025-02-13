import axios from 'axios';
import { BookingDTO, CreateBookingDTO, BookingStatus } from '../types/dtos';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5269/api';

export const bookingApi = {
    // Get all bookings (Admin only)
    getAllBookings: async () => {
        const response = await axios.get<BookingDTO[]>(`${API_URL}/bookings`);
        return response;
    },

    // Get user's bookings
    getMyBookings: async () => {
        const response = await axios.get<BookingDTO[]>(`${API_URL}/bookings/my`);
        return response;
    },

    // Get booking by id
    getBooking: async (id: string) => {
        const response = await axios.get<BookingDTO>(`${API_URL}/bookings/${id}`);
        return response;
    },

    // Create booking
    createBooking: async (data: CreateBookingDTO) => {
        const response = await axios.post<BookingDTO>(`${API_URL}/bookings`, data);
        return response;
    },

    // Update booking status (Admin only)
    updateBookingStatus: async (id: string, status: BookingStatus) => {
        const response = await axios.patch<BookingDTO>(`${API_URL}/bookings/${id}/status`, { status });
        return response;
    },

    // Cancel booking
    cancelBooking: async (id: string) => {
        const response = await axios.delete<void>(`${API_URL}/bookings/${id}`);
        return response;
    }
};
