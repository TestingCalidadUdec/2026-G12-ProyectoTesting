import React, { useState, useEffect } from 'react';
import type { Exercise, ExerciseCreate } from '../../types/exercise';
import { ExerciseType } from '../../types/exercise';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exerciseData: ExerciseCreate | any) => Promise<void>;
  exercise?: Exercise | null;
  loading: boolean;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  exercise,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    exercise_type: 'WEIGHT_BASED' as ExerciseType,
    muscle_group: '',
    equipment: '',
    instructions: '',
    is_active: true,
  });
  const [error, setError] = useState('');

  // Common muscle groups and equipment options
  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body'
  ];
  
  const equipmentOptions = [
    'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 
    'Resistance Band', 'Medicine Ball', 'Treadmill', 'Bike', 'Other'
  ];

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name || '',
        description: exercise.description || '',
        exercise_type: exercise.exercise_type,
        muscle_group: exercise.muscle_group || '',
        equipment: exercise.equipment || '',
        instructions: exercise.instructions || '',
        is_active: exercise.is_active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        exercise_type: ExerciseType.WEIGHT_BASED,
        muscle_group: '',
        equipment: '',
        instructions: '',
        is_active: true,
      });
    }
    setError('');
  }, [exercise, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Exercise name is required');
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to save exercise');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {exercise ? 'Edit Exercise' : 'Create New Exercise'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Bench Press"
                />
              </div>

              <div>
                <label htmlFor="exercise_type" className="block text-sm font-medium text-gray-700">
                  Exercise Type *
                </label>
                <select
                  name="exercise_type"
                  id="exercise_type"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  value={formData.exercise_type}
                  onChange={handleChange}
                >
                  <option value="WEIGHT_BASED">Weight-Based (Reps & Weight)</option>
                  <option value="TIME_BASED">Time-Based (Duration)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="muscle_group" className="block text-sm font-medium text-gray-700">
                  Muscle Group
                </label>
                <select
                  name="muscle_group"
                  id="muscle_group"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  value={formData.muscle_group}
                  onChange={handleChange}
                >
                  <option value="">Select muscle group</option>
                  {muscleGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">
                  Equipment
                </label>
                <select
                  name="equipment"
                  id="equipment"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  value={formData.equipment}
                  onChange={handleChange}
                >
                  <option value="">Select equipment</option>
                  {equipmentOptions.map(equip => (
                    <option key={equip} value={equip}>{equip}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={2}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the exercise..."
              />
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                Instructions
              </label>
              <textarea
                name="instructions"
                id="instructions"
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Step-by-step instructions for performing this exercise..."
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span className="ml-2 text-sm text-gray-700">Active (visible to users)</span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;