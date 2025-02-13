import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaChalkboardTeacher,
  FaCalendar,
  FaClock,
  FaMoneyBill,
} from 'react-icons/fa';
import { RootState } from '../../store/store';

interface Coach {
  id: number;
  name: string;
  specialization: string;
  experience: string;
  hourlyRate: number;
  availability: {
    day: string;
    slots: string[];
  }[];
  image: string;
}

const UserCoaching: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Mock coaches data - replace with actual data from Redux store
  const coaches: Coach[] = [
    {
      id: 1,
      name: 'John Smith',
      specialization: 'Advanced Techniques',
      experience: '10+ years',
      hourlyRate: 75,
      availability: [
        {
          day: '2025-02-13',
          slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        },
        {
          day: '2025-02-14',
          slots: ['09:00', '10:00', '13:00', '14:00', '15:00'],
        },
      ],
      image: 'https://example.com/coach1.jpg',
    },
    // Add more coaches...
  ];

  const handleBookSession = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach || !selectedDate || !selectedTime) return;

    try {
      // Dispatch book coaching session action
      setShowBookingModal(false);
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      console.error('Failed to book coaching session:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Tennis Coaching Sessions
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Book private coaching sessions with our professional tennis coaches.
            </p>
          </div>
        </div>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
          >
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={coach.image}
                    alt={coach.name}
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {coach.name}
                  </h3>
                  <p className="text-sm text-gray-500">{coach.specialization}</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Experience</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {coach.experience}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Hourly Rate
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ${coach.hourlyRate}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => handleBookSession(coach)}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-tennis-green hover:bg-tennis-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tennis-green"
              >
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedCoach && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowBookingModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-tennis-green">
                  <FaChalkboardTeacher className="h-6 w-6 text-white" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Book a Coaching Session
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Book a session with {selectedCoach.name}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select Date
                  </label>
                  <select
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-tennis-green focus:border-tennis-green sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Choose a date</option>
                    {selectedCoach.availability.map((day) => (
                      <option key={day.day} value={day.day}>
                        {new Date(day.day).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDate && (
                  <div>
                    <label
                      htmlFor="time"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Select Time
                    </label>
                    <select
                      id="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-tennis-green focus:border-tennis-green sm:text-sm rounded-md"
                      required
                    >
                      <option value="">Choose a time</option>
                      {selectedCoach.availability
                        .find((day) => day.day === selectedDate)
                        ?.slots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-tennis-green text-base font-medium text-white hover:bg-tennis-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tennis-green sm:col-start-2 sm:text-sm"
                  >
                    Book Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tennis-green sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCoaching;
