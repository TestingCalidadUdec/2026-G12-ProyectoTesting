import React, { useState } from 'react';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import type { WorkoutExercise } from '../../types/workout';
import { ExerciseType } from '../../types/exercise';
import SetTracker from './SetTracker';

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise;
}

const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({ workoutExercise }) => {
  const {
    removeExerciseFromWorkout,
    addSet,
    updateExerciseNotes
  } = useActiveWorkout();
  
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(workoutExercise.notes || '');
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const { exercise, sets = [] } = workoutExercise;
  
  // Handle case where exercise data is not populated
  if (!exercise) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-4">
          <p className="text-gray-500">Exercise data not loaded</p>
          <p className="text-sm text-gray-400">Exercise ID: {workoutExercise.exercise_id}</p>
        </div>
      </div>
    );
  }
  
  const isWeightBased = exercise.exercise_type === ExerciseType.WEIGHT_BASED;
  const isTimeBased = exercise.exercise_type === ExerciseType.TIME_BASED;
  
  const completedSets = sets.filter(set => set.completed).length;
  const totalSets = sets.length;

  const handleAddSet = async () => {
    try {
      setIsAddingSet(true);
      const setNumber = totalSets + 1;
      
      await addSet(workoutExercise.id, {
        set_number: setNumber,
        completed: false
      });
    } catch (error) {
      console.error('Failed to add set:', error);
    } finally {
      setIsAddingSet(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateExerciseNotes(workoutExercise.id, notes);
      setShowNotes(false);
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  const handleRemoveExercise = async () => {
    try {
      await removeExerciseFromWorkout(workoutExercise.id);
      setShowRemoveConfirm(false);
    } catch (error) {
      console.error('Failed to remove exercise:', error);
    }
  };

  const formatSetSummary = () => {
    if (totalSets === 0) return 'No sets yet';
    if (completedSets === totalSets) return `${totalSets} sets completed`;
    return `${completedSets}/${totalSets} sets completed`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Exercise Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-gray-900">{exercise.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isWeightBased
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {isWeightBased ? 'Weight-Based' : 'Time-Based'}
            </span>
          </div>
          
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
            {exercise.muscle_group && (
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {exercise.muscle_group}
              </span>
            )}
            {exercise.equipment && (
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                </svg>
                {exercise.equipment}
              </span>
            )}
            <span className="text-indigo-600 font-medium">{formatSetSummary()}</span>
          </div>

          {exercise.description && (
            <p className="mt-2 text-sm text-gray-600">{exercise.description}</p>
          )}
        </div>

        {/* Actions Menu */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-md text-sm font-medium ${
              showNotes || workoutExercise.notes
                ? 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Exercise notes"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="p-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-100"
            title="Remove exercise"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Exercise Notes */}
      {showNotes && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label htmlFor="exerciseNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Exercise Notes
          </label>
          <textarea
            id="exerciseNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add notes about this exercise (form cues, adjustments, etc.)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="mt-2 flex space-x-2">
            <button
              onClick={handleSaveNotes}
              className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save
            </button>
            <button
              onClick={() => {
                setNotes(workoutExercise.notes || '');
                setShowNotes(false);
              }}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sets List */}
      <div className="space-y-2">
        {/* Sets Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">Sets</h4>
          <button
            onClick={handleAddSet}
            disabled={isAddingSet}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isAddingSet ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
            ) : (
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
            Add Set
          </button>
        </div>

        {/* Sets Table Header */}
        {sets.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-1">Set</div>
              {isWeightBased && (
                <>
                  <div className="col-span-2">Weight</div>
                  <div className="col-span-2">Reps</div>
                </>
              )}
              {isTimeBased && (
                <div className="col-span-4">Duration</div>
              )}
              <div className="col-span-2">Rest</div>
              <div className="col-span-3">Notes</div>
              <div className="col-span-2">Status</div>
            </div>
          </div>
        )}

        {/* Sets */}
        {sets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm">No sets added yet. Click "Add Set" to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sets
              .sort((a, b) => a.set_number - b.set_number)
              .map((set) => (
                <SetTracker
                  key={set.id}
                  set={set}
                  workoutExerciseId={workoutExercise.id}
                  exerciseType={exercise.exercise_type}
                />
              ))}
          </div>
        )}
      </div>

      {/* Remove Exercise Confirmation */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Exercise?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove "{exercise.name}" from this workout? All sets will be lost.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveExercise}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Remove Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutExerciseCard;