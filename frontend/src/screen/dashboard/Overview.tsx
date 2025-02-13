import React, { useEffect, useState } from 'react';
import { FaVolleyballBall, FaCalendarCheck, FaMoneyBillWave } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import axiosInstance from '../../api/axiosConfig';

interface StatItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: string;
}

const Overview: React.FC = () => {
  const [courts, setCourts] = useState([]);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [courtsError, setCourtsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setCourtsLoading(true);
      try {
        const courtsResponse = await axiosInstance.get('/courts');
        setCourts(courtsResponse.data);
        setCourtsError(null);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setCourtsError('Failed to fetch courts data');
      } finally {
        setCourtsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (courtsLoading) {
    return <LoadingSpinner />;
  }

  if (courtsError) {
    return <ErrorAlert message={courtsError} />;
  }

  const stats: StatItem[] = [
    {
      title: 'Total Courts',
      value: courts.length,
      icon: <FaVolleyballBall className="text-blue-500" />,
      change: '+2 this month',
    },
    {
      title: 'Today\'s Bookings',
      value: '12',
      icon: <FaCalendarCheck className="text-purple-500" />,
      change: '+3 from yesterday',
    },
    {
      title: 'Revenue',
      value: '$2,500',
      icon: <FaMoneyBillWave className="text-yellow-500" />,
      change: '+15% this month',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl">{stat.icon}</div>
              <span className="text-sm text-green-500">{stat.change}</span>
            </div>
            <h2 className="text-gray-600 text-sm mb-2">{stat.title}</h2>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
