import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BookingDTO, BookingStatus } from '../../types/dtos';
import { bookingApi } from '../../api/bookingApi';

interface BookingState {
    bookings: BookingDTO[];
    loading: boolean;
    error: string | null;
    selectedBooking: BookingDTO | null;
}

const initialState: BookingState = {
    bookings: [],
    loading: false,
    error: null,
    selectedBooking: null
};

// Async thunks
export const fetchAllBookings = createAsyncThunk(
    'bookings/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await bookingApi.getAllBookings();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    'bookings/updateStatus',
    async ({ bookingId, status }: { bookingId: string; status: BookingStatus }, { dispatch, rejectWithValue }) => {
        try {
            const response = await bookingApi.updateBookingStatus(bookingId, status);
            // After successful update, refresh the bookings list
            dispatch(fetchAllBookings());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update booking status');
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'bookings/cancel',
    async (bookingId: string, { dispatch, rejectWithValue }) => {
        try {
            await bookingApi.cancelBooking(bookingId);
            // After successful cancellation, refresh the bookings list
            dispatch(fetchAllBookings());
            return bookingId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
        }
    }
);

const bookingSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        setSelectedBooking: (state, action: PayloadAction<BookingDTO | null>) => {
            state.selectedBooking = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all bookings
            .addCase(fetchAllBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload;
                state.error = null;
            })
            .addCase(fetchAllBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to fetch bookings';
            })
            // Update booking status
            .addCase(updateBookingStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                state.loading = false;
                // Update the booking in the list optimistically
                const updatedBooking = action.payload;
                state.bookings = state.bookings.map(booking =>
                    booking.bookingId === updatedBooking.bookingId ? updatedBooking : booking
                );
                state.error = null;
            })
            .addCase(updateBookingStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to update booking status';
            })
            // Cancel booking
            .addCase(cancelBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the cancelled booking from the list optimistically
                state.bookings = state.bookings.filter(booking => booking.bookingId !== action.payload);
                state.error = null;
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to cancel booking';
            });
    }
});

export const { setSelectedBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
