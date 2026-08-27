import React, { useState, useEffect } from 'react';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import type { ExerciseSet } from '../../types/workout';
import { ExerciseType } from '../../types/exercise';

interface SetTrackerProps {
  set: ExerciseSet;
  workoutExerciseId: number;
  exerciseType: ExerciseType;
}

const SetTracker: React.FC<SetTrackerProps> = ({ set, workoutExerciseId, exerciseType }) => {
  const { updateSet, deleteSet, completeSet } = useActiveWorkout();
  
  const [weight, setWeight] = useState(set.weight?.toString() || '');
  const [reps, setReps] = useState(set.reps?.toString() || '');
  const [durationMinutes, setDurationMinutes] = useState(
    set.duration ? Math.floor(set.duration / 60).toString() : ''
  );
  const [durationSeconds, setDurationSeconds] = useState(
    set.duration ? (set.duration % 60).toString() : ''
  );
  const [restMinutes, setRestMinutes] = useState(
    set.rest_duration ? Math.floor(set.rest_duration / 60).toString() : ''
  );
  const [restSeconds, setRestSeconds] = useState(
    set.rest_duration ? (set.rest_duration % 60).toString() : ''
  );
  const [notes, setNotes] = useState(set.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const isWeightBased = exerciseType === ExerciseType.WEIGHT_BASED;
  const isTimeBased = exerciseType === ExerciseType.TIME_BASED;

  useEffect(() => {
    // Auto-save changes after a delay
    const timeoutId = setTimeout(() => {
      handleAutoSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [weight, reps, durationMinutes, durationSeconds, restMinutes, restSeconds, notes]);

  const handleAutoSave = async () => {
    const updates: any = {};
    let hasChanges = false;

    // Weight-based fields
    if (isWeightBased) {
      const weightValue = weight ? parseFloat(weight) : undefined;
      const repsValue = reps ? parseInt(reps) : undefined;
      
      if (weightValue !== set.weight) {
        updates.weight = weightValue;
        hasChanges = true;
      }
      if (repsValue !== set.reps) {
        updates.reps = repsValue;
        hasChanges = true;
      }
    }

    // Time-based fields
    if (isTimeBased) {
      const totalDurationSeconds = 
        (parseInt(durationMinutes) || 0) * 60 + (parseInt(durationSeconds) || 0);
      
      if (totalDurationSeconds !== (set.duration || 0)) {
        updates.duration = totalDurationSeconds || undefined;
        hasChanges = true;
      }
    }

    // Rest time
    const totalRestSeconds = 
      (parseInt(restMinutes) || 0) * 60 + (parseInt(restSeconds) || 0);
    
    if (totalRestSeconds !== (set.rest_duration || 0)) {
      updates.rest_duration = totalRestSeconds || undefined;
      hasChanges = true;
    }

    // Notes
    if (notes !== (set.notes || '')) {
      updates.notes = notes || undefined;
      hasChanges = true;
    }

    if (hasChanges) {
      try {
        setIsUpdating(true);
        await updateSet(workoutExerciseId, set.id, updates);
      } catch (error) {
        console.error('Failed to update set:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCompleteSet = async () => {
    try {
      await completeSet(workoutExerciseId, set.id);
    } catch (error) {
      console.error('Failed to complete set:', error);
    }
  };

  const handleDeleteSet = async () => {
    if (window.confirm('Are you sure you want to delete this set?')) {
      try {
        await deleteSet(workoutExerciseId, set.id);
      } catch (error) {
        console.error('Failed to delete set:', error);
      }
    }
  };

  const formatTime = (minutes: string, seconds: string): string => {
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    if (m === 0 && s === 0) return '';
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-3 rounded-lg border ${
      set.completed 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Set Number */}
        <div className="col-span-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            set.completed
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}>
            {set.set_number}
          </div>
        </div>

        {/* Weight-based inputs */}
        {isWeightBased && (
          <>
            <div className="col-span-2">
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0"
                  step="0.5"
                  min="0"
                  className="w-full pl-3 pr-12 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">kgs</span>
              </div>
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Time-based inputs */}
        {isTimeBased && (
          <div className="col-span-4">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="0"
                min="0"
                className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">m</span>
              <input
                type="number"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                placeholder="0"
                min="0"
                max="59"
                className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">s</span>
            </div>
          </div>
        )}

        {/* Rest Time */}
        <div className="col-span-2">
          <div className="flex items-center space-x-1">
            <input
              type="number"
              value={restMinutes}
              onChange={(e) => setRestMinutes(e.target.value)}
              placeholder="0"
              min="0"
              className="w-12 px-1 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">m</span>
            <input
              type="number"
              value={restSeconds}
              onChange={(e) => setRestSeconds(e.target.value)}
              placeholder="0"
              min="0"
              max="59"
              className="w-12 px-1 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">s</span>
          </div>
        </div>

        {/* Notes */}
        <div className="col-span-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes..."
              className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {isUpdating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            {!set.completed ? (
              <button
                onClick={handleCompleteSet}
                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                title="Complete set"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            ) : (
              <span className="text-green-600 text-sm font-medium">✓ Done</span>
            )}
            
            <button
              onClick={handleDeleteSet}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
              title="Delete set"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Set Summary for completed sets */}
      {set.completed && (
        <div className="mt-2 pt-2 border-t border-green-200">
          <div className="text-sm text-green-700">
            {isWeightBased && weight && reps && (
              <span>{weight} kgs × {reps} reps</span>
            )}
            {isTimeBased && (durationMinutes || durationSeconds) && (
              <span>{formatTime(durationMinutes, durationSeconds)}</span>
            )}
            {(restMinutes || restSeconds) && (
              <span className="ml-2">• Rest: {formatTime(restMinutes, restSeconds)}</span>
            )}
            {notes && (
              <span className="ml-2">• {notes}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SetTracker;