import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CourtDTO, CreateBookingDTO, BookingDTO, BookingStatus } from '../../types/dtos';
import { bookingApi } from '../../api/bookingApi';
import { courtApi } from '../../api/courtApi';
import { RootState } from '../../store/store';

const UserDashboard: React.FC = () => {
    const [courts, setCourts] = useState<CourtDTO[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<CourtDTO | null>(null);
    const [myBookings, setMyBookings] = useState<BookingDTO[]>([]);
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [endTime, setEndTime] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [courtsResponse, bookingsResponse] = await Promise.all([
                courtApi.getAvailableCourts(),
                bookingApi.getMyBookings()
            ]);
            setCourts(courtsResponse.data);
            setMyBookings(bookingsResponse.data);
            setError(null);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourt) {
            setError('Please select a court');
            return;
        }

        setLoading(true);
        try {
            const bookingData: CreateBookingDTO = {
                courtId: selectedCourt.id,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            };

            await bookingApi.createBooking(bookingData);
            await loadData();
            // Reset form
            setSelectedCourt(null);
            setStartTime(new Date());
            setEndTime(new Date());
            setError(null);
        } catch (err) {
            setError('Failed to create booking');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        setLoading(true);
        try {
            await bookingApi.cancelBooking(bookingId);
            await loadData();
            setError(null);
        } catch (err) {
            setError('Failed to cancel booking');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Book a Court</h2>
                <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Select Court
                        </label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={selectedCourt?.id || ''}
                            onChange={(e) => setSelectedCourt(courts.find(c => c.id === e.target.value) || null)}
                        >
                            <option value="">Select a court</option>
                            {courts.map(court => (
                                <option key={court.id} value={court.id}>
                                    {court.name} - ${court.pricePerHour}/hour
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={startTime.toISOString().slice(0, 16)}
                                onChange={(e) => setStartTime(new Date(e.target.value))}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={endTime.toISOString().slice(0, 16)}
                                onChange={(e) => setEndTime(new Date(e.target.value))}
                                min={startTime.toISOString().slice(0, 16)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-tennis-green text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Booking...' : 'Book Court'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Court</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {myBookings.map(booking => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 border-b">{booking.court.name}</td>
                                    <td className="px-6 py-4 border-b">
                                        {new Date(booking.startTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        {new Date(booking.endTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        <span className={`px-2 py-1 rounded ${
                                            booking.status === BookingStatus.Approved
                                                ? 'bg-green-100 text-green-800'
                                                : booking.status === BookingStatus.Pending
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        {(booking.status === BookingStatus.Pending || booking.status === BookingStatus.Approved) && (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
        </div>
    );
};

export default UserDashboard;
