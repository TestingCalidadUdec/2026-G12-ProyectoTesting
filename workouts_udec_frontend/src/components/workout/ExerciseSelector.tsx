import React, { useState, useEffect, useMemo } from 'react';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { exerciseService } from '../../services/exerciseService';
import type { Exercise } from '../../types/exercise';
import { ExerciseType } from '../../types/exercise';

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ isOpen, onClose }) => {
  const { activeWorkout, addExerciseToWorkout } = useActiveWorkout();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [addingExerciseId, setAddingExerciseId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const exercisesData = await exerciseService.getExercises(0, 1000);
      setExercises(exercisesData.filter(ex => ex.is_active));
    } catch (err: any) {
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (exercise: Exercise) => {
    if (!activeWorkout) {
      console.error('No active workout found');
      setError('No active workout found');
      return;
    }

    try {
      setAddingExerciseId(exercise.id);
      setError('');
      
      const orderInWorkout = (activeWorkout.workout_exercises?.length || 0) + 1;
      
      const exerciseData = {
        exercise_id: exercise.id,
        order_index: orderInWorkout
      };
      
      await addExerciseToWorkout(exerciseData);
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to add exercise';
      setError(errorMessage);
      // Don't close modal on error, let user retry
    } finally {
      setAddingExerciseId(null);
    }
  };

  const isExerciseInWorkout = (exerciseId: number): boolean => {
    return activeWorkout?.workout_exercises?.some(we => we.exercise_id === exerciseId) || false;
  };

  // Get unique muscle groups for filtering
  const uniqueMuscleGroups = useMemo(() => {
    const groups = exercises
      .map(e => e.muscle_group)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return groups;
  }, [exercises]);

  // Filter exercises based on search and filters
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          exercise.name.toLowerCase().includes(searchLower) ||
          exercise.description?.toLowerCase().includes(searchLower) ||
          exercise.muscle_group?.toLowerCase().includes(searchLower) ||
          exercise.equipment?.toLowerCase().includes(searchLower);
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

      return true;
    });
  }, [exercises, searchTerm, exerciseTypeFilter, muscleGroupFilter]);

  const handleClose = () => {
    setSearchTerm('');
    setExerciseTypeFilter('');
    setMuscleGroupFilter('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Exercise to Workout</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Exercises
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, muscle group..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 mb-2">
              Exercise Type
            </label>
            <select
              id="exerciseType"
              value={exerciseTypeFilter}
              onChange={(e) => setExerciseTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value={ExerciseType.WEIGHT_BASED}>Weight-Based</option>
              <option value={ExerciseType.TIME_BASED}>Time-Based</option>
            </select>
          </div>

          <div>
            <label htmlFor="muscleGroup" className="block text-sm font-medium text-gray-700 mb-2">
              Muscle Group
            </label>
            <select
              id="muscleGroup"
              value={muscleGroupFilter}
              onChange={(e) => setMuscleGroupFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Muscle Groups</option>
              {uniqueMuscleGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No exercises found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((exercise) => {
                const isInWorkout = isExerciseInWorkout(exercise.id);
                const isAdding = addingExerciseId === exercise.id;
                
                return (
                  <div
                    key={exercise.id}
                    className={`p-4 border rounded-lg ${
                      isInWorkout 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{exercise.name}</h3>
                        <div className="mt-1 flex items-center space-x-2 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            exercise.exercise_type === ExerciseType.WEIGHT_BASED
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {exercise.exercise_type === ExerciseType.WEIGHT_BASED ? 'Weight-Based' : 'Time-Based'}
                          </span>
                          {exercise.muscle_group && (
                            <span className="text-gray-500">• {exercise.muscle_group}</span>
                          )}
                          {exercise.equipment && (
                            <span className="text-gray-500">• {exercise.equipment}</span>
                          )}
                        </div>
                        {exercise.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{exercise.description}</p>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        {isInWorkout ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Added
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddExercise(exercise)}
                            disabled={isAdding}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAdding ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSelector;