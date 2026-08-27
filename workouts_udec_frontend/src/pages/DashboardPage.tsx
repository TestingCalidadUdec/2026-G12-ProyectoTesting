import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { workoutService } from '../services/workoutService';
import type { Workout } from '../types/workout';
import Layout from '../components/ui/Layout';
import StartWorkoutModal from '../components/workout/StartWorkoutModal';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { activeWorkout, workoutTimer } = useActiveWorkout();
  const navigate = useNavigate();
  const [showStartModal, setShowStartModal] = useState(false);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    totalExercises: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent workouts
      const recent = await workoutService.getWorkoutHistory(0, 5);
      setRecentWorkouts(recent);
      
      // Calculate stats
      const allWorkouts = await workoutService.getWorkoutHistory(0, 1000);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const thisWeekWorkouts = allWorkouts.filter(workout => 
        new Date(workout.started_at) >= weekAgo
      );
      
      const totalExercises = allWorkouts.reduce((sum, workout) => 
        sum + (workout.workout_exercises?.length || 0), 0
      );
      
      setWorkoutStats({
        totalWorkouts: allWorkouts.length,
        thisWeekWorkouts: thisWeekWorkouts.length,
        totalExercises
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            Track your workouts, monitor your progress, and stay consistent.
          </p>
        </div>

        {/* Active Workout Banner */}
        {activeWorkout && (
          <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Workout in Progress</h2>
                <p className="mt-1 opacity-90">
                  {activeWorkout.name || 'Current Workout'} • {formatTimer(workoutTimer)}
                </p>
                <p className="mt-1 text-sm opacity-80">
                  {activeWorkout.workout_exercises?.length || 0} exercises added
                </p>
              </div>
              <button
                onClick={() => navigate('/workout')}
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Continue Workout
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {!activeWorkout && (
                  <button
                    onClick={() => setShowStartModal(true)}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start New Workout
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </button>

                {user?.is_admin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center justify-center px-4 py-3 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Panel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Stats</h3>
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{workoutStats.totalWorkouts}</div>
                    <div className="text-sm text-gray-500">Total Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{workoutStats.thisWeekWorkouts}</div>
                    <div className="text-sm text-gray-500">This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{workoutStats.totalExercises}</div>
                    <div className="text-sm text-gray-500">Total Exercises</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Workouts</h3>
            <button
              onClick={() => navigate('/workout')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View all →
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : recentWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No workouts yet</h3>
              <p className="mt-2 text-gray-600">Start your first workout to see your progress here.</p>
              {!activeWorkout && (
                <button
                  onClick={() => setShowStartModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Start Your First Workout
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentWorkouts.map((workout) => (
                <div key={workout.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {workout.name || 'Workout'}
                      </h4>
                      <div className="mt-1 text-sm text-gray-600">
                        {formatDate(workout.started_at)} • {workout.workout_exercises?.length || 0} exercises
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workout.completed_at 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {workout.completed_at ? 'Completed' : 'Active'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start Workout Modal */}
        <StartWorkoutModal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          onWorkoutStarted={() => {
            setShowStartModal(false);
            navigate('/workout');
          }}
        />
      </div>
    </Layout>
  );
};

export default DashboardPage;