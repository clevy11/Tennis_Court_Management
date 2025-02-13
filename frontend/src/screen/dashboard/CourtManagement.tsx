// CourtManagement.tsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { courtApi } from '../../api/courtApi';
import { CourtDTO, CreateCourtDTO } from '../../types/dtos';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

const CourtManagement: React.FC = () => {
    const [courts, setCourts] = useState<CourtDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState<CourtDTO | null>(null);
    const [formData, setFormData] = useState<CreateCourtDTO>({
        name: '',
        description: '',
        type: 'Indoor',
        surface: 'Hard',
        pricePerHour: 0,
    });

    useEffect(() => {
        loadCourts();
    }, []);

    const loadCourts = async () => {
        setLoading(true);
        try {
            const response = await courtApi.getAllCourts();
            setCourts(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load courts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingCourt) {
                const response = await courtApi.updateCourt(editingCourt.courtId, formData);
                setCourts(courts.map(court => court.courtId === editingCourt.courtId ? response.data : court));
            } else {
                const response = await courtApi.createCourt(formData);
                setCourts([...courts, response.data]);
            }
            setIsModalOpen(false);
            resetForm();
            setError(null);
        } catch (err) {
            setError(`Failed to ${editingCourt ? 'update' : 'create'} court`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this court?')) return;
        setLoading(true);
        try {
            await courtApi.deleteCourt(id);
            setCourts(courts.filter(court => court.courtId !== id));
            setError(null);
        } catch (err) {
            setError('Failed to delete court');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (court: CourtDTO) => {
        setEditingCourt(court);
        setFormData({
            name: court.name,
            description: court.description || '',
            type: court.type,
            surface: court.surface,
            pricePerHour: court.pricePerHour,
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'Indoor',
            surface: 'Hard',
            pricePerHour: 0,
        });
        setEditingCourt(null);
    };

    if (loading && courts.length === 0) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            {error && <ErrorAlert message={error} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Court Management</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                    <FaPlus /> Add New Court
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surface</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Per Hour</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {courts.map((court) => (
                            <tr key={court.courtId}>
                                <td className="px-6 py-4 whitespace-nowrap">{court.name}</td>
                                <td className="px-6 py-4">{court.description}</td>
                                <td className="px-6 py-4">{court.type}</td>
                                <td className="px-6 py-4">{court.surface}</td>
                                <td className="px-6 py-4">${court.pricePerHour}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button onClick={() => handleEdit(court)} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                                    <button onClick={() => handleDelete(court.courtId)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CourtManagement;
