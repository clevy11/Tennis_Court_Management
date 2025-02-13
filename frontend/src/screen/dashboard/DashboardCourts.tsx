import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchCourts,
  createCourt,
  updateCourt,
  deleteCourt,
} from '../../store/slices/courtSlice';
import { CourtDTO, CreateCourtDTO } from '../../types/dtos';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import CourtModal from '../../components/CourtModal';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const DashboardCourts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courts, loading, error } = useSelector((state: RootState) => state.courts);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<CourtDTO | null>(null);

  useEffect(() => {
    dispatch(fetchCourts());
  }, [dispatch]);

  const handleEdit = (court: CourtDTO) => {
    setSelectedCourt(court);
    setIsModalOpen(true);
  };

  const handleDelete = async (courtId: string) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        await dispatch(deleteCourt(courtId)).unwrap();
        // Refresh the courts list after successful deletion
        dispatch(fetchCourts());
      } catch (error) {
        console.error('Failed to delete court:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourt(null);
  };

  const handleSubmit = async (data: CreateCourtDTO) => {
    try {
      if (selectedCourt) {
        await dispatch(updateCourt({ id: selectedCourt.courtId, data })).unwrap();
      } else {
        await dispatch(createCourt(data)).unwrap();
      }
      // Refresh the courts list after successful creation or update
      dispatch(fetchCourts());
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create or update court:', error);
    }
  };

  // Only admin users can manage courts
  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Court Management</h2>
        <p className="text-gray-600">You don't have permission to manage courts.</p>
      </div>
    );
  }

  if (loading && courts.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Court Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaPlus className="mr-2" />
          Add Court
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Surface
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate/Hour
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
            {courts.map((court) => (
              <tr key={court.courtId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{court.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{court.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{court.surface}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${court.hourlyRate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      court.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {court.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(court)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <FaEdit className="inline-block" />
                  </button>
                  <button
                    onClick={() => handleDelete(court.courtId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash className="inline-block" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CourtModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          editingCourt={selectedCourt}
          loading={loading}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default DashboardCourts;