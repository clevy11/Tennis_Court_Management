import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../components/navbar";

interface BookingFormData {
  date: string;
  time: string;
  courtType: string;
  coachId?: string;
}

const NewBooking: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [availableCourts, setAvailableCourts] = useState<any[]>([]);

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00"
  ];

  const courtTypes = [
    { value: "", label: "All Types" },
    { value: "grass", label: "Grass" },
    { value: "normal", label: "Normal" },
    { value: "railway", label: "Railway" },
    { value: "jardin", label: "Jardin" }
  ];

  const onSubmit = async (data: BookingFormData) => {
    try {
      // Here you would call your API to search for available courts
      const response = await fetch('/api/courts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to search for courts');
      }

      const courts = await response.json();
      setAvailableCourts(courts);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Failed to search for available courts. Please try again.");
      console.error('Search failed:', error);
    }
  };

  const handleBookCourt = async (courtId: string, date: string, time: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courtId,
          date,
          time,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book court');
      }

      navigate('/bookings');
    } catch (error) {
      setErrorMessage("Failed to book the court. Please try again.");
      console.error('Booking failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Search Courts Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-tennis-navy mb-6">Book a Court</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  {...register("date", { required: "Date is required" })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tennis-green focus:ring-tennis-green"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <select
                  {...register("time", { required: "Time is required" })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tennis-green focus:ring-tennis-green"
                >
                  <option value="">Select Time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Court Type</label>
                <select
                  {...register("courtType")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tennis-green focus:ring-tennis-green"
                >
                  {courtTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-tennis-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Search Available Courts
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          {/* Available Courts */}
          {availableCourts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-tennis-navy mb-4">Available Courts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCourts.map((court) => (
                  <div key={court.id} className="border rounded-lg p-4 hover:shadow-lg transition duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">{court.name}</h4>
                        <p className="text-sm text-gray-600">{court.type}</p>
                      </div>
                      <span className="text-tennis-green font-bold">${court.price}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <i className="fas fa-calendar-day mr-2"></i>
                        {new Date(court.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        <i className="fas fa-clock mr-2"></i>
                        {court.time}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBookCourt(court.id, court.date, court.time)}
                      className="mt-4 w-full bg-tennis-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewBooking;
