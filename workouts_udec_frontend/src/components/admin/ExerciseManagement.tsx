import React, { useState, useEffect, useMemo } from 'react';
import { exerciseService } from '../../services/exerciseService';
import ExerciseTable from './ExerciseTable';
import ExerciseModal from './ExerciseModal';
import ExerciseFilters from './ExerciseFilters';
import type { Exercise, ExerciseCreate } from '../../types/exercise';

const ExerciseManagement: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getExercises(0, 1000); // Get all exercises
      setExercises(data);
    } catch (error: any) {
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = () => {
    setEditingExercise(null);
    setShowModal(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowModal(true);
  };

  const handleSaveExercise = async (exerciseData: ExerciseCreate | any) => {
    setModalLoading(true);
    setError('');

    try {
      if (editingExercise) {
        // Update existing exercise
        const updatedExercise = await exerciseService.updateExercise(editingExercise.id, exerciseData);
        setExercises(exercises.map(e => e.id === editingExercise.id ? updatedExercise : e));
        setSuccess('Exercise updated successfully');
      } else {
        // Create new exercise
        const newExercise = await exerciseService.createExercise(exerciseData as ExerciseCreate);
        setExercises([...exercises, newExercise]);
        setSuccess('Exercise created successfully');
      }
      setShowModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      throw error; // Let ExerciseModal handle the error display
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteExercise = async (exercise: Exercise) => {
    try {
      await exerciseService.deleteExercise(exercise.id);
      setExercises(exercises.filter(e => e.id !== exercise.id));
      setSuccess('Exercise deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to delete exercise');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExercise(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setExerciseTypeFilter('');
    setMuscleGroupFilter('');
    setEquipmentFilter('');
    setStatusFilter('');
  };

  // Get unique values for filter dropdowns
  const uniqueMuscleGroups = useMemo(() => {
    const groups = exercises
      .map(e => e.muscle_group)
      .filter((value): value is string => Boolean(value))
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return groups;
  }, [exercises]);

  const uniqueEquipment = useMemo(() => {
    const equipment = exercises
      .map(e => e.equipment)
      .filter((value): value is string => Boolean(value))
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return equipment;
  }, [exercises]);

  // Filter exercises based on current filters
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          exercise.name.toLowerCase().includes(searchLower) ||
          exercise.description?.toLowerCase().includes(searchLower) ||
          exercise.muscle_group?.toLowerCase().includes(searchLower) ||
          exercise.equipment?.toLowerCase().includes(searchLower) ||
          exercise.instructions?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Exercise type filter
      if (exerciseTypeFilter && exercise.exercise_type !== exerciseTypeFilter) {
        return false;
      }

      // Muscle group filter
      if (muscleGroupFilter && exercise.muscle_group !== muscleGroupFilter) {
        return false;
      }

      // Equipment filter
      if (equipmentFilter && exercise.equipment !== equipmentFilter) {
        return false;
      }

      // Status filter
      if (statusFilter) {
        const isActive = statusFilter === 'active';
        if (exercise.is_active !== isActive) {
          return false;
        }
      }

      return true;
    });
  }, [exercises, searchTerm, exerciseTypeFilter, muscleGroupFilter, equipmentFilter, statusFilter]);

  // Calculate statistics based on filtered results
  const stats = {
    total: filteredExercises.length,
    active: filteredExercises.filter(e => e.is_active).length,
    weightBased: filteredExercises.filter(e => e.exercise_type === 'WEIGHT_BASED').length,
    timeBased: filteredExercises.filter(e => e.exercise_type === 'TIME_BASED').length,
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercise Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage the master list of exercises available to users.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateExercise}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Exercise
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <ExerciseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        exerciseType={exerciseTypeFilter}
        onExerciseTypeChange={setExerciseTypeFilter}
        muscleGroup={muscleGroupFilter}
        onMuscleGroupChange={setMuscleGroupFilter}
        equipment={equipmentFilter}
        onEquipmentChange={setEquipmentFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        muscleGroups={uniqueMuscleGroups}
        equipmentOptions={uniqueEquipment}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Exercises</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight-Based</p>
                <p className="text-2xl font-bold text-blue-600">{stats.weightBased}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time-Based</p>
                <p className="text-2xl font-bold text-green-600">{stats.timeBased}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <ExerciseTable
            exercises={filteredExercises}
            onEditExercise={handleEditExercise}
            onDeleteExercise={handleDeleteExercise}
            loading={loading}
          />
        </div>
      </div>

      <ExerciseModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveExercise}
        exercise={editingExercise}
        loading={modalLoading}
      />
    </div>
  );
};

export default ExerciseManagement;