import React, { useState, useEffect } from 'react';
import { FaCalendarPlus, FaCalendarTimes } from 'react-icons/fa';
import { courtApi } from '../../api/courtApi';
import { bookingApi } from '../../api/bookingApi';
import { CourtDTO, BookingDTO, CreateBookingDTO, BookingStatus } from '../../types/dtos';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

const Bookings: React.FC = () => {
    const [courts, setCourts] = useState<CourtDTO[]>([]);
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<CreateBookingDTO>({
        courtId: '',
        startTime: '',
        endTime: ''
    });

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
            setBookings(bookingsResponse.data);
            setError(null);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            await bookingApi.createBooking(formData);
            await loadData();
            setIsModalOpen(false);
            resetForm();
            setError(null);
        } catch (err) {
            setError('Failed to create booking');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        setLoading(true);
        try {
            await bookingApi.cancelBooking(bookingId);
            await loadData();
        } catch (err) {
            setError('Failed to cancel booking');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            courtId: '',
            startTime: '',
            endTime: ''
        });
    };

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.Approved:
                return 'bg-green-100 text-green-800';
            case BookingStatus.Pending:
                return 'bg-yellow-100 text-yellow-800';
            case BookingStatus.Rejected:
                return 'bg-red-100 text-red-800';
            case BookingStatus.Cancelled:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && courts.length === 0 && bookings.length === 0) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            {error && <ErrorAlert message={error} />}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-tennis-green text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                    <FaCalendarPlus /> Book a Court
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <tr key={booking.bookingId}>
                                <td className="px-6 py-4 whitespace-nowrap">{booking.court.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(booking.startTime).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1)} hours
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {(booking.status === BookingStatus.Pending || booking.status === BookingStatus.Approved) && (
                                        <button
                                            onClick={() => handleCancelBooking(booking.bookingId)}
                                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                        >
                                            <FaCalendarTimes /> Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Booking Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Book a Court</h3>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Court</label>
                                <select
                                    value={formData.courtId}
                                    onChange={(e) => setFormData({ ...formData, courtId: e.target.value })} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                >
                                    <option value="">Select a court</option>
                                    {courts.map(court => (
                                        <option key={court.courtId} value={court.courtId}>
                                            {court.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    min={new Date().toISOString().slice(0, 16)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    min={formData.startTime}
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-tennis-green text-white rounded-md hover:bg-green-700"
                                    disabled={loading}
                                >
                                    {loading ? 'Booking...' : 'Book Court'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
