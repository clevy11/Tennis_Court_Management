import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, 
  faIdCard, 
  faUserTie, 
  faComments, 
  faCreditCard 
} from '@fortawesome/free-solid-svg-icons';

// Improved interfaces with more detailed types
interface Booking {
  id: number;
  courtId: number;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  duration: number;
}

interface CoachingSession {
  id: number;
  coachName: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  type: 'Private' | 'Group';
}

interface Membership {
  type: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Pending';
}

interface PaymentSummary {
  totalPending: number;
  pendingAmount: number;
  lastPaymentDate?: string;
}

const UserDashboard: React.FC = () => {
  // State management for dashboard data
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [coachingSessions, setCoachingSessions] = useState<CoachingSession[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    totalPending: 0,
    pendingAmount: 0
  });

  // Simulated data fetching (replace with actual API calls)
  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        // Mock data - replace with actual API calls
        setRecentBookings([
          {
            id: 1,
            courtId: 2,
            date: '2024-02-15',
            time: '10:00 AM',
            status: 'Confirmed',
            duration: 60
          },
          {
            id: 2,
            courtId: 1,
            date: '2024-02-16',
            time: '02:00 PM',
            status: 'Pending',
            duration: 90
          }
        ]);

        setCoachingSessions([
          {
            id: 1,
            coachName: 'John Doe',
            date: '2024-02-17',
            time: '11:00 AM',
            status: 'Confirmed',
            type: 'Private'
          }
        ]);

        setMembership({
          type: 'Premium',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'Active'
        });

        setUnreadMessages(3);

        setPaymentSummary({
          totalPending: 2,
          pendingAmount: 250.00,
          lastPaymentDate: '2024-01-15'
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        // Handle error state
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Court Bookings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tennis-navy">My Bookings</h2>
          <FontAwesomeIcon icon={faCalendar} className="text-tennis-green text-2xl" />
        </div>
        {recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div 
                key={booking.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">Court {booking.courtId}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.date).toLocaleDateString()} 
                    {' '}{booking.time} ({booking.duration} mins)
                  </p>
                </div>
                <span 
                  className={`px-3 py-1 rounded-full text-sm ${
                    booking.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : booking.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent bookings</p>
        )}
        <Link 
          to="/dashboard/court-booking" 
          className="mt-4 inline-block text-tennis-green hover:text-tennis-navy"
        >
          Book a court →
        </Link>
      </div>

      {/* Membership Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tennis-navy">Membership Status</h2>
          <FontAwesomeIcon icon={faIdCard} className="text-tennis-green text-2xl" />
        </div>
        {membership ? (
          <div className="space-y-2">
            <p className={`font-medium ${
              membership.status === 'Active' 
                ? 'text-green-600' 
                : membership.status === 'Expired'
                ? 'text-red-600'
                : 'text-yellow-600'
            }`}>
              {membership.type} Membership - {membership.status}
            </p>
            <p className="text-sm text-gray-600">
              Valid from: {new Date(membership.startDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Valid until: {new Date(membership.endDate).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-500">No active membership</p>
            <Link 
              to="/dashboard/membership" 
              className="mt-4 inline-block text-tennis-green hover:text-tennis-navy"
            >
              Apply for membership →
            </Link>
          </>
        )}
      </div>

      {/* Coaching Sessions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tennis-navy">Coaching Sessions</h2>
          <FontAwesomeIcon icon={faUserTie} className="text-tennis-green text-2xl" />
        </div>
        {coachingSessions.length > 0 ? (
          <div className="space-y-3">
            {coachingSessions.map((session) => (
              <div 
                key={session.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{session.type} Session with {session.coachName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(session.date).toLocaleDateString()} {session.time}
                  </p>
                </div>
                <span 
                  className={`px-3 py-1 rounded-full text-sm ${
                    session.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : session.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No coaching sessions</p>
        )}
        <Link 
          to="/dashboard/coaching-session" 
          className="mt-4 inline-block text-tennis-green hover:text-tennis-navy"
        >
          Book a session →
        </Link>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tennis-navy">Recent Messages</h2>
          <FontAwesomeIcon icon={faComments} className="text-tennis-green text-2xl" />
        </div>
        {unreadMessages > 0 ? (
          <div className="space-y-2">
            <p className="text-tennis-yellow font-medium">
              You have {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-600">
              Check your inbox for new communications
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No new messages</p>
        )}
        <Link 
          to="/dashboard/messages" 
          className="mt-4 inline-block text-tennis-green hover:text-tennis-navy"
        >
          View all messages →
        </Link>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tennis-navy">Payment Summary</h2>
          <FontAwesomeIcon icon={faCreditCard} className="text-tennis-green text-2xl" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Pending Payments:</span>
            <span className="font-medium">{paymentSummary.totalPending}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount Due:</span>
            <span className="font-medium text-red-600">
              ${paymentSummary.pendingAmount.toFixed(2)}
            </span>
          </div>
          {paymentSummary.lastPaymentDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Last Payment:</span>
              <span className="text-sm text-gray-600">
                {new Date(paymentSummary.lastPaymentDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        <Link 
          to="/dashboard/payments" 
          className="mt-4 inline-block text-tennis-green hover:text-tennis-navy"
        >
          View payments →
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;