import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { workoutService } from '../services/workoutService';
import type { WorkoutTemplate } from '../types/workout';
import Layout from '../components/ui/Layout';
import StartWorkoutModal from '../components/workout/StartWorkoutModal';

const WorkoutsPage: React.FC = () => {
  const { activeWorkout, workoutTimer, startWorkoutFromTemplate } = useActiveWorkout();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const templatesData = await workoutService.getWorkoutTemplates(0, 50);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load workout templates');
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

  const handleStartFromTemplate = async (template: WorkoutTemplate) => {
    try {
      setError(null);
      await startWorkoutFromTemplate(template.id, {
        name: template.name
      });
      
      // Navigate to the active workout page
      navigate('/workout');
    } catch (err) {
      console.error('Failed to start workout from template:', err);
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to start workout from template');
    }
  };

  const handleTemplatePreview = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const getTotalExercises = (template: WorkoutTemplate): number => {
    return template.template_exercises?.length || 0;
  };


  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
          <p className="mt-2 text-gray-600">
            Start a new workout session or choose from our curated templates.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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

        {/* Quick Start Section */}
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {!activeWorkout && (
              <button
                onClick={() => setShowStartModal(true)}
                className="flex-1 flex items-center justify-center px-6 py-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Empty Workout
              </button>
            )}
            
            <button
              onClick={() => navigate('/history')}
              className="flex-1 flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Workout History
            </button>
          </div>
        </div>

        {/* Workout Templates */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Workout Templates</h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No templates available</h3>
              <p className="mt-2 text-gray-600">
                Check back later for curated workout templates, or start with an empty workout.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    {template.is_public && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                  
                  {template.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>
                  )}
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <span>{getTotalExercises(template)} exercises</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTemplatePreview(template)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Preview
                    </button>
                    {!activeWorkout && (
                      <button
                        onClick={() => handleStartFromTemplate(template)}
                        className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Start
                      </button>
                    )}
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

        {/* Template Preview Modal */}
        {showTemplateModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedTemplate.name}</h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {selectedTemplate.description && (
                <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>
              )}
              
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Exercises ({getTotalExercises(selectedTemplate)})</h4>
                {selectedTemplate.template_exercises && selectedTemplate.template_exercises.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTemplate.template_exercises
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((templateExercise, index) => (
                        <div key={templateExercise.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {templateExercise.exercise?.name || 'Unknown Exercise'}
                              </p>
                              {templateExercise.exercise?.muscle_group && (
                                <p className="text-sm text-gray-500">{templateExercise.exercise.muscle_group}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {templateExercise.suggested_sets && (
                              <p>{templateExercise.suggested_sets} sets</p>
                            )}
                            {templateExercise.suggested_reps && (
                              <p>{templateExercise.suggested_reps} reps</p>
                            )}
                            {templateExercise.suggested_weight && (
                              <p>{templateExercise.suggested_weight} kg</p>
                            )}
                            {templateExercise.suggested_duration && (
                              <p>{Math.round(templateExercise.suggested_duration / 60)} min</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No exercises defined for this template</p>
                )}
              </div>
              
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Close
                </button>
                {!activeWorkout && (
                  <button
                    onClick={() => {
                      setShowTemplateModal(false);
                      handleStartFromTemplate(selectedTemplate);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Start This Workout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WorkoutsPage;