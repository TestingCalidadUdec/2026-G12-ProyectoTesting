import React, { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService';
import type { Workout } from '../types/workout';
import Layout from '../components/ui/Layout';

const HistoryPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const workoutsData = await workoutService.getWorkoutHistory(0, 100);
      setWorkouts(workoutsData);
    } catch (err) {
      console.error('Failed to load workout history:', err);
      setError('Failed to load workout history');
    } finally {
      setLoading(false);
    }
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

  const formatDateFull = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (startTime: string, endTime?: string): string => {
    if (!endTime) return 'In progress';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getTotalVolume = (workout: Workout): number => {
    if (!workout.workout_exercises) return 0;
    
    return workout.workout_exercises.reduce((totalVolume, exercise) => {
      if (!exercise.sets) return totalVolume;
      
      return totalVolume + exercise.sets.reduce((exerciseVolume, set) => {
        return exerciseVolume + ((set.weight || 0) * (set.reps || 0));
      }, 0);
    }, 0);
  };

  const getTotalSets = (workout: Workout): number => {
    if (!workout.workout_exercises) return 0;
    
    return workout.workout_exercises.reduce((total, exercise) => {
      return total + (exercise.sets?.length || 0);
    }, 0);
  };

  const getFilteredWorkouts = () => {
    let filtered = workouts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(workout => 
        workout.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.workout_exercises?.some(exercise => 
          exercise.exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week': {
          filterDate.setDate(now.getDate() - 7);
          break;
        }
        case 'month': {
          filterDate.setMonth(now.getMonth() - 1);
          break;
        }
        case '3months': {
          filterDate.setMonth(now.getMonth() - 3);
          break;
        }
      }
      
      filtered = filtered.filter(workout => 
        new Date(workout.started_at) >= filterDate
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
        case 'duration':
          const durationA = a.completed_at ? 
            new Date(a.completed_at).getTime() - new Date(a.started_at).getTime() : 0;
          const durationB = b.completed_at ? 
            new Date(b.completed_at).getTime() - new Date(b.started_at).getTime() : 0;
          return durationB - durationA;
        case 'volume':
          return getTotalVolume(b) - getTotalVolume(a);
        case 'exercises':
          return (b.workout_exercises?.length || 0) - (a.workout_exercises?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutModal(true);
  };

  const filteredWorkouts = getFilteredWorkouts();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workout History</h1>
          <p className="mt-2 text-gray-600">
            Review your past workouts and track your progress over time.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search workouts or exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <select
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All time</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
                <option value="3months">Past 3 months</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="date">Date</option>
                <option value="duration">Duration</option>
                <option value="volume">Volume</option>
                <option value="exercises">Exercise count</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={loadWorkouts}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Workout List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredWorkouts.length === 0 ? (
            <div className="text-center py-12 px-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchTerm || dateFilter !== 'all' ? 'No workouts found' : 'No workouts yet'}
              </h3>
              <p className="mt-2 text-gray-600">
                {searchTerm || dateFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start your first workout to see your progress here.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => handleWorkoutClick(workout)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {workout.name || 'Workout'}
                        </h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          workout.completed_at 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {workout.completed_at ? 'Completed' : 'In Progress'}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(workout.started_at)}
                        </span>
                        
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDuration(workout.started_at, workout.completed_at)}
                        </span>
                        
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {workout.workout_exercises?.length || 0} exercises
                        </span>
                        
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          {getTotalSets(workout)} sets
                        </span>
                        
                        {getTotalVolume(workout) > 0 && (
                          <span className="flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {Math.round(getTotalVolume(workout))} kg volume
                          </span>
                        )}
                      </div>
                      
                      {workout.notes && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {workout.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workout Detail Modal */}
        {showWorkoutModal && selectedWorkout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">
                      {selectedWorkout.name || 'Workout Details'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateFull(selectedWorkout.started_at)} • {formatDuration(selectedWorkout.started_at, selectedWorkout.completed_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWorkoutModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {selectedWorkout.notes && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Workout Notes</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedWorkout.notes}</p>
                  </div>
                )}
                
                {selectedWorkout.workout_exercises && selectedWorkout.workout_exercises.length > 0 ? (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Exercises ({selectedWorkout.workout_exercises.length})
                    </h4>
                    <div className="space-y-6">
                      {selectedWorkout.workout_exercises
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((workoutExercise, index) => (
                          <div key={workoutExercise.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                                {index + 1}
                              </span>
                              <div>
                                <h5 className="font-medium text-gray-900">{workoutExercise.exercise.name}</h5>
                                {workoutExercise.exercise.muscle_group && (
                                  <p className="text-sm text-gray-500">{workoutExercise.exercise.muscle_group}</p>
                                )}
                              </div>
                            </div>
                            
                            {workoutExercise.notes && (
                              <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                                <strong>Notes:</strong> {workoutExercise.notes}
                              </p>
                            )}
                            
                            {workoutExercise.sets && workoutExercise.sets.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Set</th>
                                      {workoutExercise.exercise.exercise_type === 'WEIGHT_BASED' ? (
                                        <>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reps</th>
                                        </>
                                      ) : (
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                      )}
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {workoutExercise.sets
                                      .sort((a, b) => a.set_number - b.set_number)
                                      .map((set) => (
                                        <tr key={set.id}>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {set.set_number}
                                          </td>
                                          {workoutExercise.exercise.exercise_type === 'WEIGHT_BASED' ? (
                                            <>
                                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {set.weight || '-'}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {set.reps || '-'}
                                              </td>
                                            </>
                                          ) : (
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                              {set.duration ? `${Math.round(set.duration / 60)} min` : '-'}
                                            </td>
                                          )}
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                              set.completed 
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                              {set.completed ? 'Completed' : 'Incomplete'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No sets recorded</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No exercises recorded for this workout</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;