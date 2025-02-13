import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BookingDTO, BookingStatus } from '../../types/dtos';
import { RootState } from '../../store/store';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchAllBookings, updateBookingStatus, cancelBooking, clearError } from '../../store/slices/bookingSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

const BookingManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { bookings, loading, error } = useSelector((state: RootState) => state.bookings);
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'All'>('All');

    useEffect(() => {
        dispatch(fetchAllBookings());
    }, [dispatch]);

    // Clear any errors when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
        try {
            await dispatch(updateBookingStatus({ bookingId, status: newStatus })).unwrap();
        } catch (error) {
            console.error('Failed to update booking status:', error);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await dispatch(cancelBooking(bookingId)).unwrap();
            } catch (error) {
                console.error('Failed to cancel booking:', error);
            }
        }
    };

    const filteredBookings = statusFilter === 'All'
        ? bookings
        : bookings.filter(booking => booking.status === statusFilter);

    if (loading && bookings.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-4">
            {error && <ErrorAlert message={error} />}
            
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Booking Management</h1>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">
                        Filter by Status:
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'All')}
                        className="rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="All">All</option>
                        <option value={BookingStatus.Pending}>Pending</option>
                        <option value={BookingStatus.Approved}>Approved</option>
                        <option value={BookingStatus.Rejected}>Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Court
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Start Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                End Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.map((booking) => (
                            <tr key={booking.bookingId}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{booking.court.name}</div>
                                    <div className="text-xs text-gray-500">{booking.court.type} - {booking.court.surface}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {booking.user.firstName} {booking.user.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{booking.user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {new Date(booking.startTime).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {new Date(booking.endTime).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        booking.status === BookingStatus.Approved
                                            ? 'bg-green-100 text-green-800'
                                            : booking.status === BookingStatus.Pending
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {booking.status === BookingStatus.Pending && (
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => handleStatusChange(booking.bookingId, BookingStatus.Approved)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(booking.bookingId, BookingStatus.Rejected)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {booking.status === BookingStatus.Approved && (
                                        <button
                                            onClick={() => handleCancelBooking(booking.bookingId)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingManagement;
