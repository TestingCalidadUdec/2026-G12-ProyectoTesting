import React, { useState, useEffect } from 'react';
import { workoutTemplateService } from '../../services/workoutService';
import { exerciseService } from '../../services/exerciseService';
import type { 
  WorkoutTemplate, 
  WorkoutTemplateCreate, 
  WorkoutTemplateUpdate,
  WorkoutTemplateExercise
} from '../../types/workout';
import type { Exercise } from '../../types/exercise';

interface WorkoutTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: WorkoutTemplate | null;
  onSave: (template: WorkoutTemplate) => void;
}

const WorkoutTemplateModal: React.FC<WorkoutTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [templateExercises, setTemplateExercises] = useState<WorkoutTemplateExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAvailableExercises();
      if (template) {
        setName(template.name);
        setDescription(template.description || '');
        setIsPublic(template.is_public);
        setTemplateExercises(template.template_exercises || []);
      } else {
        resetForm();
      }
    }
  }, [isOpen, template]);

  const loadAvailableExercises = async () => {
    try {
      setExercisesLoading(true);
      const exercises = await exerciseService.getExercises();
      setAvailableExercises(exercises);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setExercisesLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsPublic(false);
    setTemplateExercises([]);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let savedTemplate: WorkoutTemplate;

      if (template) {
        const updateData: WorkoutTemplateUpdate = {
          name: name.trim(),
          description: description.trim() || undefined,
          is_public: isPublic
        };
        savedTemplate = await workoutTemplateService.updateWorkoutTemplate(template.id, updateData);
      } else {
        const createData: WorkoutTemplateCreate = {
          name: name.trim(),
          description: description.trim() || undefined,
          is_public: isPublic,
          exercises: templateExercises.map(te => ({
            exercise_id: te.exercise_id,
            order_index: te.order_index,
            suggested_sets: te.suggested_sets || undefined,
            suggested_reps: te.suggested_reps || undefined,
            suggested_weight: te.suggested_weight || undefined,
            suggested_duration: te.suggested_duration || undefined
          }))
        };
        savedTemplate = await workoutTemplateService.createWorkoutTemplate(createData);
      }

      onSave(savedTemplate);
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(error.response?.data?.detail || error.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (exercise: Exercise) => {
    if (template) {
      // For existing templates, use API call
      try {
        const exerciseData = {
          exercise_id: exercise.id,
          order_index: templateExercises.length + 1,
          suggested_sets: 3,
          suggested_reps: exercise.exercise_type === 'WEIGHT_BASED' ? 10 : undefined,
          suggested_weight: exercise.exercise_type === 'WEIGHT_BASED' ? 20 : undefined,
          suggested_duration: exercise.exercise_type === 'TIME_BASED' ? 30 : undefined
        };
        
        const newTemplateExercise = await workoutTemplateService.addExerciseToTemplate(template.id, exerciseData);
        
        // Create the full object with exercise data
        const fullExercise: WorkoutTemplateExercise = {
          id: newTemplateExercise.id,
          template_id: newTemplateExercise.template_id,
          exercise_id: newTemplateExercise.exercise_id,
          exercise: exercise,
          order_index: newTemplateExercise.order_index,
          suggested_sets: newTemplateExercise.suggested_sets,
          suggested_reps: newTemplateExercise.suggested_reps,
          suggested_weight: newTemplateExercise.suggested_weight,
          suggested_duration: newTemplateExercise.suggested_duration,
          notes: newTemplateExercise.notes || '',
          created_at: newTemplateExercise.created_at || new Date().toISOString(),
          updated_at: newTemplateExercise.updated_at || new Date().toISOString()
        };
        
        setTemplateExercises([...templateExercises, fullExercise]);
        setShowExerciseSelector(false);
      } catch (err) {
        console.error('Failed to add exercise to template:', err);
        setError('Failed to add exercise to template');
      }
    } else {
      // For new templates, add to local state
      const newExercise: WorkoutTemplateExercise = {
        id: Date.now(),
        template_id: 0,
        exercise_id: exercise.id,
        exercise: exercise,
        order_index: templateExercises.length + 1,
        suggested_sets: 3,
        suggested_reps: exercise.exercise_type === 'WEIGHT_BASED' ? 10 : undefined,
        suggested_duration: exercise.exercise_type === 'TIME_BASED' ? 30 : undefined,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTemplateExercises([...templateExercises, newExercise]);
      setShowExerciseSelector(false);
    }
  };

  const handleRemoveExercise = async (exerciseId: number) => {
    if (template) {
      // For existing templates, use API call
      try {
        await workoutTemplateService.removeExerciseFromTemplate(template.id, exerciseId);
        setTemplateExercises(templateExercises.filter(te => te.id !== exerciseId));
      } catch (err) {
        console.error('Failed to remove exercise from template:', err);
        setError('Failed to remove exercise from template');
      }
    } else {
      // For new templates, just remove from local state
      setTemplateExercises(templateExercises.filter(te => te.id !== exerciseId));
    }
  };

  const handleUpdateExercise = (exerciseId: number, updates: Partial<WorkoutTemplateExercise>) => {
    setTemplateExercises(templateExercises.map(te => 
      te.id === exerciseId ? { ...te, ...updates } : te
    ));
  };

  const moveExercise = (exerciseId: number, direction: 'up' | 'down') => {
    const currentIndex = templateExercises.findIndex(te => te.id === exerciseId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= templateExercises.length) return;

    const newExercises = [...templateExercises];
    [newExercises[currentIndex], newExercises[newIndex]] = [newExercises[newIndex], newExercises[currentIndex]];
    
    // Update order_index
    newExercises.forEach((exercise, index) => {
      exercise.order_index = index + 1;
    });

    setTemplateExercises(newExercises);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const filteredExercises = availableExercises.filter(exercise =>
    !templateExercises.some(te => te.exercise_id === exercise.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Push Pull Legs, Full Body Beginner"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Private</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Public</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this workout template..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Template Exercises */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Exercises</h3>
              <button
                type="button"
                onClick={() => setShowExerciseSelector(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Exercise
              </button>
            </div>

            {templateExercises.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No exercises yet</h3>
                <p className="mt-2 text-gray-600">Add exercises to create a complete workout template</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templateExercises
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((templateExercise, index) => (
                    <div key={templateExercise.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {templateExercise.exercise?.name || `Exercise ID: ${templateExercise.exercise_id}`}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {templateExercise.exercise?.muscle_group || 'Unknown muscle group'}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => moveExercise(templateExercise.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveExercise(templateExercise.id, 'down')}
                            disabled={index === templateExercises.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(templateExercise.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Remove exercise"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Suggested Sets
                          </label>
                          <input
                            type="number"
                            value={templateExercise.suggested_sets || ''}
                            onChange={(e) => handleUpdateExercise(templateExercise.id, {
                              suggested_sets: e.target.value ? parseInt(e.target.value) : undefined
                            })}
                            min="1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        {templateExercise.exercise?.exercise_type === 'WEIGHT_BASED' && (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Suggested Reps
                              </label>
                              <input
                                type="number"
                                value={templateExercise.suggested_reps || ''}
                                onChange={(e) => handleUpdateExercise(templateExercise.id, {
                                  suggested_reps: e.target.value ? parseInt(e.target.value) : undefined
                                })}
                                min="1"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Suggested Weight (kg)
                              </label>
                              <input
                                type="number"
                                value={templateExercise.suggested_weight || ''}
                                onChange={(e) => handleUpdateExercise(templateExercise.id, {
                                  suggested_weight: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                                min="0"
                                step="0.5"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </>
                        )}

                        {templateExercise.exercise?.exercise_type === 'TIME_BASED' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Suggested Duration (sec)
                            </label>
                            <input
                              type="number"
                              value={templateExercise.suggested_duration || ''}
                              onChange={(e) => handleUpdateExercise(templateExercise.id, {
                                suggested_duration: e.target.value ? parseInt(e.target.value) : undefined
                              })}
                              min="1"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>

        {/* Exercise Selector Modal */}
        {showExerciseSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select Exercise</h3>
                <button
                  onClick={() => setShowExerciseSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {exercisesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      onClick={() => handleAddExercise(exercise)}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                          <p className="text-sm text-gray-600">{exercise.muscle_group}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {exercise.exercise_type === 'WEIGHT_BASED' ? 'Weight-based' : 'Time-based'}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredExercises.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No more exercises available to add</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTemplateModal;