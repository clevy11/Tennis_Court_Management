import React, { useEffect, useState } from 'react';
import { courtApi } from '../../api/courtApi';
import { bookingApi } from '../../api/bookingApi';
import { CourtDTO, BookingDTO, BookingStatus } from '../../types/dtos';

const AdminDashboard: React.FC = () => {
    const [courts, setCourts] = useState<CourtDTO[]>([]);
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [courtsData, bookingsData] = await Promise.all([
                courtApi.getAllCourts(),
                bookingApi.getAllBookings()
            ]);
            setCourts(courtsData.data);
            setBookings(bookingsData.data);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBookingStatusUpdate = async (bookingId: string, status: BookingStatus) => {
        try {
            await bookingApi.updateBookingStatus(bookingId, status);
            await loadDashboardData(); // Refresh data
        } catch (err) {
            setError('Failed to update booking status');
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-tennis-green text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <span className="text-2xl font-bold">Admin Dashboard</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Courts Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tennis Courts</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 border-b">Name</th>
                                        <th className="px-6 py-3 border-b">Price/Hour</th>
                                        <th className="px-6 py-3 border-b">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courts.map(court => (
                                        <tr key={court.id}>
                                            <td className="px-6 py-4 border-b">{court.name}</td>
                                            <td className="px-6 py-4 border-b">${court.pricePerHour}</td>
                                            <td className="px-6 py-4 border-b">
                                                <span className={`px-2 py-1 rounded ${court.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {court.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bookings Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Bookings</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 border-b">Court</th>
                                        <th className="px-6 py-3 border-b">User</th>
                                        <th className="px-6 py-3 border-b">Time</th>
                                        <th className="px-6 py-3 border-b">Status</th>
                                        <th className="px-6 py-3 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4 border-b">{booking.court.name}</td>
                                            <td className="px-6 py-4 border-b">{`${booking.user.firstName} ${booking.user.lastName}`}</td>
                                            <td className="px-6 py-4 border-b">
                                                {new Date(booking.startTime).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 border-b">
                                                <span className={`px-2 py-1 rounded ${
                                                    booking.status === BookingStatus.Approved ? 'bg-green-100 text-green-800' :
                                                    booking.status === BookingStatus.Pending ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 border-b">
                                                {booking.status === BookingStatus.Pending && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleBookingStatusUpdate(booking.bookingId, BookingStatus.Approved)}
                                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleBookingStatusUpdate(booking.bookingId, BookingStatus.Rejected)}
                                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
