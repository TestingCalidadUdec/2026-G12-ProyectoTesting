import React, { useState, useEffect } from 'react';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { workoutService } from '../../services/workoutService';
import type { WorkoutTemplate } from '../../types/workout';

interface StartWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutStarted: () => void;
}

const StartWorkoutModal: React.FC<StartWorkoutModalProps> = ({
  isOpen,
  onClose,
  onWorkoutStarted
}) => {
  const { startWorkout, startWorkoutFromTemplate, loading } = useActiveWorkout();
  const [workoutName, setWorkoutName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const templatesData = await workoutService.getWorkoutTemplates();
      setTemplates(templatesData);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    try {
      setError('');
      
      if (selectedTemplate) {
        await startWorkoutFromTemplate(selectedTemplate, { name: workoutName || undefined });
      } else {
        await startWorkout({ name: workoutName || undefined });
      }
      
      handleClose();
      onWorkoutStarted();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to start workout');
    }
  };

  const handleClose = () => {
    setWorkoutName('');
    setSelectedTemplate(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Start New Workout</h2>
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

        <div className="space-y-4">
          {/* Workout Name */}
          <div>
            <label htmlFor="workoutName" className="block text-sm font-medium text-gray-700 mb-2">
              Workout Name (Optional)
            </label>
            <input
              type="text"
              id="workoutName"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Push Day, Morning Run, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start from Template (Optional)
            </label>
            
            {templatesLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div>
                  <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="template"
                      value=""
                      checked={selectedTemplate === null}
                      onChange={() => setSelectedTemplate(null)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Blank Workout</div>
                      <div className="text-xs text-gray-500">Start with no exercises</div>
                    </div>
                  </label>
                </div>
                
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-md">
                    <label className="flex items-start p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="template"
                        value={template.id}
                        checked={selectedTemplate === template.id}
                        onChange={() => setSelectedTemplate(template.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-0.5"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {template.template_exercises?.length || 0} exercises
                            </span>
                            {template.is_public && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Public
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {template.description && (
                          <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                        )}

                        {/* Exercise Preview */}
                        {template.template_exercises && template.template_exercises.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs font-medium text-gray-700 mb-1">Exercises:</div>
                            <div className="space-y-1">
                              {template.template_exercises
                                .sort((a, b) => a.order_index - b.order_index)
                                .slice(0, 3)
                                .map((templateExercise) => (
                                  <div key={templateExercise.id} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 truncate">
                                      {templateExercise.order_index}. {templateExercise.exercise?.name || `Exercise ID: ${templateExercise.exercise_id}`}
                                    </span>
                                    <span className="text-gray-400 ml-2 flex-shrink-0">
                                      {templateExercise.suggested_sets && `${templateExercise.suggested_sets} sets`}
                                      {templateExercise.exercise?.exercise_type === 'WEIGHT_BASED' && templateExercise.suggested_reps && 
                                        ` × ${templateExercise.suggested_reps} reps`
                                      }
                                      {templateExercise.exercise?.exercise_type === 'TIME_BASED' && templateExercise.suggested_duration && 
                                        ` × ${Math.floor(templateExercise.suggested_duration / 60)}:${(templateExercise.suggested_duration % 60).toString().padStart(2, '0')}`
                                      }
                                    </span>
                                  </div>
                                ))
                              }
                              {template.template_exercises.length > 3 && (
                                <div className="text-xs text-gray-400 italic">
                                  +{template.template_exercises.length - 3} more exercises
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
                
                {templates.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No workout templates available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={handleStartWorkout}
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            Start Workout
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartWorkoutModal;