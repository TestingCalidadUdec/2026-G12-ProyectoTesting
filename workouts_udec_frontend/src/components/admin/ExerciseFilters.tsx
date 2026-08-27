import React from 'react';
import { ExerciseType } from '../../types/exercise';

interface ExerciseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  exerciseType: string;
  onExerciseTypeChange: (value: string) => void;
  muscleGroup: string;
  onMuscleGroupChange: (value: string) => void;
  equipment: string;
  onEquipmentChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  muscleGroups: string[];
  equipmentOptions: string[];
}

const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  searchTerm,
  onSearchChange,
  exerciseType,
  onExerciseTypeChange,
  muscleGroup,
  onMuscleGroupChange,
  equipment,
  onEquipmentChange,
  status,
  onStatusChange,
  onClearFilters,
  muscleGroups,
  equipmentOptions,
}) => {
  const hasFilters = searchTerm || exerciseType || muscleGroup || equipment || status;

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search exercises..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Exercise Type Filter */}
        <div className="min-w-40">
          <select
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={exerciseType}
            onChange={(e) => onExerciseTypeChange(e.target.value)}
          >
            <option value="">All Types</option>
            <option value={ExerciseType.WEIGHT_BASED}>Weight-Based</option>
            <option value={ExerciseType.TIME_BASED}>Time-Based</option>
          </select>
        </div>

        {/* Muscle Group Filter */}
        <div className="min-w-40">
          <select
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={muscleGroup}
            onChange={(e) => onMuscleGroupChange(e.target.value)}
          >
            <option value="">All Muscles</option>
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        {/* Equipment Filter */}
        <div className="min-w-40">
          <select
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={equipment}
            onChange={(e) => onEquipmentChange(e.target.value)}
          >
            <option value="">All Equipment</option>
            {equipmentOptions.map(equip => (
              <option key={equip} value={equip}>{equip}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-32">
          <select
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: {searchTerm}
            </span>
          )}
          {exerciseType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Type: {exerciseType === ExerciseType.WEIGHT_BASED ? 'Weight-Based' : 'Time-Based'}
            </span>
          )}
          {muscleGroup && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Muscle: {muscleGroup}
            </span>
          )}
          {equipment && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Equipment: {equipment}
            </span>
          )}
          {status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Status: {status === 'active' ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseFilters;