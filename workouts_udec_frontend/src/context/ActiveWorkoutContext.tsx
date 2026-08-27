import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Workout,
  WorkoutCreate,
  WorkoutExerciseCreate,
  ExerciseSetCreate,
  ExerciseSetUpdate
} from '../types/workout';
import { workoutService } from '../services/workoutService';

interface ActiveWorkoutContextType {
  // State
  activeWorkout: Workout | null;
  loading: boolean;
  error: string | null;
  workoutTimer: number; // seconds since workout started
  
  // Actions
  startWorkout: (workoutData: WorkoutCreate) => Promise<void>;
  startWorkoutFromTemplate: (templateId: number, workoutData?: Partial<WorkoutCreate>) => Promise<void>;
  completeWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  updateWorkoutNotes: (notes: string) => Promise<void>;
  
  // Exercise management
  addExerciseToWorkout: (exerciseData: WorkoutExerciseCreate) => Promise<void>;
  removeExerciseFromWorkout: (workoutExerciseId: number) => Promise<void>;
  updateExerciseNotes: (workoutExerciseId: number, notes: string) => Promise<void>;
  
  // Set management
  addSet: (workoutExerciseId: number, setData: ExerciseSetCreate) => Promise<void>;
  updateSet: (workoutExerciseId: number, setId: number, setData: ExerciseSetUpdate) => Promise<void>;
  deleteSet: (workoutExerciseId: number, setId: number) => Promise<void>;
  completeSet: (workoutExerciseId: number, setId: number) => Promise<void>;
  
  // Utility
  refreshActiveWorkout: () => Promise<void>;
  clearError: () => void;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextType | undefined>(undefined);

export const useActiveWorkout = (): ActiveWorkoutContextType => {
  const context = useContext(ActiveWorkoutContext);
  if (!context) {
    throw new Error('useActiveWorkout must be used within an ActiveWorkoutProvider');
  }
  return context;
};

interface ActiveWorkoutProviderProps {
  children: ReactNode;
}

export const ActiveWorkoutProvider: React.FC<ActiveWorkoutProviderProps> = ({ children }) => {
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);

  // Load active workout on mount
  useEffect(() => {
    loadActiveWorkout();
  }, []);

  // Timer effect
  useEffect(() => {
    if (activeWorkout && !activeWorkout.completed_at) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [activeWorkout]);

  const loadActiveWorkout = async () => {
    try {
      setLoading(true);
      const workout = await workoutService.getActiveWorkout();
      if (workout) {
        setActiveWorkout(workout);
        calculateTimer(workout);
      }
    } catch (err: any) {
      console.error('Failed to load active workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimer = (workout: Workout) => {
    if (workout.started_at) {
      const startTime = new Date(workout.started_at).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      setWorkoutTimer(elapsedSeconds);
    }
  };

  const startTimer = () => {
    if (timerInterval) return;
    
    const interval = setInterval(() => {
      setWorkoutTimer(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handleError = (err: any, defaultMessage: string) => {
    let message = defaultMessage;
    
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (Array.isArray(detail)) {
        // Handle validation errors (422)
        message = detail.map((error: any) => error.msg || error.message).join(', ');
      } else if (typeof detail === 'string') {
        message = detail;
      }
    } else if (err.message) {
      message = err.message;
    }
    
    setError(message);
    console.error(defaultMessage, err);
  };

  const startWorkout = async (workoutData: WorkoutCreate) => {
    try {
      setLoading(true);
      setError(null);
      const workout = await workoutService.createWorkout(workoutData);
      setActiveWorkout(workout);
      setWorkoutTimer(0);
    } catch (err: any) {
      handleError(err, 'Failed to start workout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startWorkoutFromTemplate = async (templateId: number, workoutData?: Partial<WorkoutCreate>) => {
    try {
      setLoading(true);
      setError(null);
      const workout = await workoutService.createWorkoutFromTemplate(templateId, workoutData);
      setActiveWorkout(workout);
      setWorkoutTimer(0);
    } catch (err: any) {
      handleError(err, 'Failed to start workout from template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeWorkout = async () => {
    if (!activeWorkout) return;

    try {
      setLoading(true);
      setError(null);
      await workoutService.completeWorkout(activeWorkout.id);
      setActiveWorkout(null);
      setWorkoutTimer(0);
    } catch (err: any) {
      handleError(err, 'Failed to complete workout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelWorkout = async () => {
    if (!activeWorkout) return;

    try {
      setLoading(true);
      setError(null);
      await workoutService.cancelWorkout(activeWorkout.id);
      setActiveWorkout(null);
      setWorkoutTimer(0);
      stopTimer();
    } catch (err: any) {
      handleError(err, 'Failed to cancel workout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkoutNotes = async (notes: string) => {
    if (!activeWorkout) return;

    try {
      const updatedWorkout = await workoutService.updateWorkoutNotes(activeWorkout.id, notes);
      setActiveWorkout(updatedWorkout);
    } catch (err: any) {
      handleError(err, 'Failed to update workout notes');
      throw err;
    }
  };

  const addExerciseToWorkout = async (exerciseData: WorkoutExerciseCreate) => {
    if (!activeWorkout) {
      throw new Error('No active workout found');
    }

    try {
      setError(null);
      const workoutExercise = await workoutService.addExerciseToWorkout(activeWorkout.id, exerciseData);
      
      setActiveWorkout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          workout_exercises: [...(prev.workout_exercises || []), workoutExercise]
        };
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to add exercise to workout';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeExerciseFromWorkout = async (workoutExerciseId: number) => {
    if (!activeWorkout) return;

    try {
      setError(null);
      await workoutService.removeExerciseFromWorkout(activeWorkout.id, workoutExerciseId);
      
      setActiveWorkout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          workout_exercises: prev.workout_exercises?.filter(we => we.id !== workoutExerciseId) || []
        };
      });
    } catch (err: any) {
      handleError(err, 'Failed to remove exercise from workout');
      throw err;
    }
  };

  const updateExerciseNotes = async (workoutExerciseId: number, notes: string) => {
    if (!activeWorkout) return;

    try {
      const updatedExercise = await workoutService.updateExerciseNotes(activeWorkout.id, workoutExerciseId, notes);
      
      setActiveWorkout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          workout_exercises: prev.workout_exercises?.map(we =>
            we.id === workoutExerciseId ? updatedExercise : we
          ) || []
        };
      });
    } catch (err: any) {
      handleError(err, 'Failed to update exercise notes');
      throw err;
    }
  };

  const addSet = async (workoutExerciseId: number, setData: ExerciseSetCreate) => {
    if (!activeWorkout) return;

    try {
      setError(null);
      const newSet = await workoutService.addSetToExercise(activeWorkout.id, workoutExerciseId, setData);
      
      setActiveWorkout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          workout_exercises: prev.workout_exercises?.map(we =>
            we.id === workoutExerciseId
              ? { ...we, sets: [...(we.sets || []), newSet] }
              : we
          ) || []
        };
      });
    } catch (err: any) {
      handleError(err, 'Failed to add set');
      throw err;
    }
  };

  const updateSet = async (workoutExerciseId: number, setId: number, setData: ExerciseSetUpdate) => {
    if (!activeWorkout) return;

    try {
      setError(null);
      const updatedSet = await workoutService.updateExerciseSet(activeWorkout.id, workoutExerciseId, setId, setData);
      
      setActiveWorkout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          workout_exercises: prev.workout_exercises?.map(we =>
            we.id === workoutExerciseId
              ? {
                  ...we,
                  sets: we.sets?.map(set =>
                    set.id === setId ? updatedSet : set
                  ) || []
                }
              : we
          ) || []
        };
      });
    } catch (err: any) {
      handleError(err, 'Failed to update set');
      throw err;
    }
  };

  const deleteSet = async (workoutExerciseId: number, setId: number) => {
    if (!activeWorkout) return;

    try {
      setError(null);
      await workoutService.deleteExerciseSet(activeWorkout.id, workoutExerciseId, setId);
      
      setActiveWorkout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          workout_exercises: prev.workout_exercises?.map(we =>
            we.id === workoutExerciseId
              ? {
                  ...we,
                  sets: we.sets?.filter(set => set.id !== setId) || []
                }
              : we
          ) || []
        };
      });
    } catch (err: any) {
      handleError(err, 'Failed to delete set');
      throw err;
    }
  };

  const completeSet = async (workoutExerciseId: number, setId: number) => {
    await updateSet(workoutExerciseId, setId, { completed: true });
  };

  const refreshActiveWorkout = async () => {
    if (activeWorkout) {
      try {
        const updated = await workoutService.getWorkout(activeWorkout.id);
        setActiveWorkout(updated);
        calculateTimer(updated);
      } catch (err: any) {
        handleError(err, 'Failed to refresh workout');
      }
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: ActiveWorkoutContextType = {
    activeWorkout,
    loading,
    error,
    workoutTimer,
    startWorkout,
    startWorkoutFromTemplate,
    completeWorkout,
    cancelWorkout,
    updateWorkoutNotes,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseNotes,
    addSet,
    updateSet,
    deleteSet,
    completeSet,
    refreshActiveWorkout,
    clearError
  };

  return (
    <ActiveWorkoutContext.Provider value={value}>
      {children}
    </ActiveWorkoutContext.Provider>
  );
};