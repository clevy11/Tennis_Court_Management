import React, { useEffect, useState } from 'react';
import { CourtDTO, CreateCourtDTO } from '../types/dtos';

interface CourtModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingCourt: CourtDTO | null;
    loading: boolean;
    onSubmit: (data: CreateCourtDTO) => Promise<void>;
}

const CourtModal: React.FC<CourtModalProps> = ({
    isOpen,
    onClose,
    editingCourt,
    loading,
    onSubmit
}) => {
    const [formData, setFormData] = useState<CreateCourtDTO>({
        name: '',
        description: '',
        type: 'Indoor',
        surface: 'Hard',
        pricePerHour: 0
    });

    useEffect(() => {
        if (editingCourt) {
            setFormData({
                name: editingCourt.name,
                description: editingCourt.description,
                type: editingCourt.type,
                surface: editingCourt.surface,
                pricePerHour: editingCourt.pricePerHour
            });
        }
    }, [editingCourt]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                        {editingCourt ? 'Edit Court' : 'Add New Court'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700">
                            Type
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700">
                            Surface
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700">
                            Price per Hour ($)
                        </label>
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

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-tennis-green text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : editingCourt ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourtModal;
