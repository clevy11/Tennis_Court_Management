import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createCourt } from '../../store/slices/courtSlice';
import { CreateCourtDTO } from '../../types/dtos';

const CreateCourt: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<CreateCourtDTO>({
        name: '',
        description: '',
        type: 'Indoor',
        surface: 'Hard',
        pricePerHour: 0
    });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(createCourt(formData)).unwrap();
            // Reset form after successful creation
            setFormData({
                name: '',
                description: '',
                type: 'Indoor',
                surface: 'Hard',
                pricePerHour: 0
            });
            navigate('/admin/dashboard');
        } catch (error) {
            setError('Failed to create court');
            console.error('Failed to create court:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-tennis-green text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <span className="text-2xl font-bold">Create New Court</span>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="bg-white text-tennis-green px-4 py-2 rounded-md hover:bg-gray-100"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Tennis Court</h2>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Court Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="Indoor">Indoor</option>
                                <option value="Outdoor">Outdoor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Surface</label>
                            <select
                                name="surface"
                                value={formData.surface}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="Hard">Hard</option>
                                <option value="Clay">Clay</option>
                                <option value="Grass">Grass</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price per Hour ($)</label>
                            <input
                                type="number"
                                name="pricePerHour"
                                value={formData.pricePerHour}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-tennis-green text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Create Court
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourt;
