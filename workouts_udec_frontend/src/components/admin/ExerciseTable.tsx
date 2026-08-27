import React, { useState } from 'react';
import type { Exercise } from '../../types/exercise';

interface ExerciseTableProps {
  exercises: Exercise[];
  onEditExercise: (exercise: Exercise) => void;
  onDeleteExercise: (exercise: Exercise) => void;
  loading: boolean;
}

const ExerciseTable: React.FC<ExerciseTableProps> = ({
  exercises,
  onEditExercise,
  onDeleteExercise,
  loading
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDeleteClick = (exercise: Exercise) => {
    if (deleteConfirm === exercise.id) {
      onDeleteExercise(exercise);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(exercise.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  const getExerciseTypeColor = (type: string) => {
    return type === 'WEIGHT_BASED' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Exercises</h3>
        <p className="mt-1 text-sm text-gray-600">
          Manage exercise database and exercise types
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exercise
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Type
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Muscle
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Equipment
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {exercises.map((exercise) => (
              <tr key={exercise.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{exercise.name}</div>
                    {exercise.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {exercise.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap w-24">
                  <span
                    className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${getExerciseTypeColor(exercise.exercise_type)}`}
                  >
                    {exercise.exercise_type === 'WEIGHT_BASED' ? 'Weight' : 'Time'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-20 truncate">
                  {exercise.muscle_group || '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-20 truncate">
                  {exercise.equipment || '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap w-16">
                  <span
                    className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                      exercise.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {exercise.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                  {formatDate(exercise.created_at)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium w-40">
                  <div className="flex justify-end space-x-1">
                    {deleteConfirm === exercise.id ? (
                      <>
                        <button
                          onClick={() => handleDeleteClick(exercise)}
                          className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded text-sm flex-shrink-0"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded text-sm flex-shrink-0"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onEditExercise(exercise)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded text-sm flex-shrink-0"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(exercise)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-sm flex-shrink-0"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {exercises.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <p className="text-sm">No exercises found</p>
            <p className="text-xs text-gray-400 mt-1">Create your first exercise to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseTable;