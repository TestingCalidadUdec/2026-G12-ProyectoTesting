import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import Layout from '../components/ui/Layout';
import StartWorkoutModal from '../components/workout/StartWorkoutModal';
import ExerciseSelector from '../components/workout/ExerciseSelector';
import WorkoutExerciseCard from '../components/workout/WorkoutExerciseCard';

const WorkoutPage: React.FC = () => {
  const {
    activeWorkout,
    loading,
    error,
    workoutTimer,
    completeWorkout,
    cancelWorkout,
    clearError
  } = useActiveWorkout();
  
  const navigate = useNavigate();
  const [showStartModal, setShowStartModal] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const formatTimer = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCompleteWorkout = async () => {
    try {
      await completeWorkout();
      setShowCompleteConfirm(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete workout:', error);
    }
  };

  const handleCancelWorkout = async () => {
    if (window.confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      try {
        await cancelWorkout();
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to cancel workout:', error);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {!activeWorkout ? (
          // No active workout - show start options
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="mt-4 text-xl font-medium text-gray-900">Ready to start your workout?</h2>
              <p className="mt-2 text-gray-600">
                Begin a new workout session to track your exercises, sets, and progress.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowStartModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Start Workout
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Active workout - show workout interface
          <div className="space-y-6">
            {/* Workout Header */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {activeWorkout.name || 'Current Workout'}
                  </h1>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-mono text-lg text-indigo-600">{formatTimer(workoutTimer)}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowExerciseSelector(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Exercise
                  </button>
                  <button
                    onClick={() => setShowCompleteConfirm(true)}
                    className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete
                  </button>
                  <button
                    onClick={handleCancelWorkout}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Workout Exercises */}
            <div className="space-y-4">
              {activeWorkout.workout_exercises && activeWorkout.workout_exercises.length > 0 ? (
                activeWorkout.workout_exercises
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((workoutExercise) => (
                    <WorkoutExerciseCard
                      key={workoutExercise.id}
                      workoutExercise={workoutExercise}
                    />
                  ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No exercises yet</h3>
                  <p className="mt-2 text-gray-600">Add exercises to your workout to start tracking your sets.</p>
                  <button
                    onClick={() => setShowExerciseSelector(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Add First Exercise
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        <StartWorkoutModal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          onWorkoutStarted={() => {
            setShowStartModal(false);
          }}
        />

        <ExerciseSelector
          isOpen={showExerciseSelector}
          onClose={() => setShowExerciseSelector(false)}
        />

        {/* Complete Workout Confirmation */}
        {showCompleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Workout?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to complete this workout? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowCompleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteWorkout}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Complete Workout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WorkoutPage;