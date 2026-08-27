import { api } from './api';
import type {
  Workout,
  WorkoutCreate,
  WorkoutUpdate,
  WorkoutExercise,
  WorkoutExerciseCreate,
  WorkoutExerciseUpdate,
  ExerciseSet,
  ExerciseSetCreate,
  ExerciseSetUpdate,
  WorkoutTemplate,
  WorkoutTemplateCreate,
  WorkoutTemplateUpdate,
  WorkoutTemplateExercise,
  WorkoutTemplateExerciseCreate,
  WorkoutSummary,
  ExerciseProgression
} from '../types/workout';

export const workoutService = {
  // Workout management
  async createWorkout(workoutData: WorkoutCreate): Promise<Workout> {
    const response = await api.post('/workouts', workoutData);
    return response.data;
  },

  async getWorkouts(skip: number = 0, limit: number = 100): Promise<Workout[]> {
    const response = await api.get(`/workouts?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getActiveWorkout(): Promise<Workout | null> {
    try {
      const response = await api.get('/workouts/active');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getWorkout(workoutId: number): Promise<Workout> {
    const response = await api.get(`/workouts/${workoutId}`);
    return response.data;
  },

  async updateWorkout(workoutId: number, workoutData: WorkoutUpdate): Promise<Workout> {
    const response = await api.put(`/workouts/${workoutId}`, workoutData);
    return response.data;
  },

  async completeWorkout(workoutId: number): Promise<Workout> {
    const response = await api.put(`/workouts/${workoutId}/complete`);
    return response.data;
  },

  async cancelWorkout(workoutId: number): Promise<void> {
    await api.delete(`/workouts/${workoutId}`);
  },

  async getWorkoutHistory(skip: number = 0, limit: number = 50): Promise<Workout[]> {
    const response = await api.get(`/workouts/history?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Workout exercises management
  async addExerciseToWorkout(workoutId: number, exerciseData: WorkoutExerciseCreate): Promise<WorkoutExercise> {
    const response = await api.post(`/workouts/${workoutId}/exercises`, exerciseData);
    return response.data;
  },

  async updateWorkoutExercise(
    workoutId: number,
    exerciseId: number,
    exerciseData: WorkoutExerciseUpdate
  ): Promise<WorkoutExercise> {
    const response = await api.put(`/workouts/${workoutId}/exercises/${exerciseId}`, exerciseData);
    return response.data;
  },

  async removeExerciseFromWorkout(workoutId: number, exerciseId: number): Promise<void> {
    await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`);
  },

  // Exercise sets management
  async addSetToExercise(
    workoutId: number,
    exerciseId: number,
    setData: ExerciseSetCreate
  ): Promise<ExerciseSet> {
    const response = await api.post(`/workouts/${workoutId}/exercises/${exerciseId}/sets`, setData);
    return response.data;
  },

  async updateExerciseSet(
    workoutId: number,
    exerciseId: number,
    setId: number,
    setData: ExerciseSetUpdate
  ): Promise<ExerciseSet> {
    const response = await api.put(`/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`, setData);
    return response.data;
  },

  async deleteExerciseSet(workoutId: number, exerciseId: number, setId: number): Promise<void> {
    await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`);
  },

  // Workout templates
  async getWorkoutTemplates(skip: number = 0, limit: number = 100): Promise<WorkoutTemplate[]> {
    const response = await api.get(`/workouts/templates?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getWorkoutTemplate(templateId: number): Promise<WorkoutTemplate> {
    const response = await api.get(`/workouts/templates/${templateId}`);
    return response.data;
  },

  async createWorkoutFromTemplate(templateId: number, workoutData?: Partial<WorkoutCreate>): Promise<Workout> {
    const response = await api.post(`/workouts/templates/${templateId}/create-workout`, workoutData || {});
    return response.data;
  },

  // Progression and analytics
  async getExerciseProgression(exerciseId: number, limit: number = 10): Promise<ExerciseProgression> {
    const response = await api.get(`/workouts/progression/${exerciseId}?limit=${limit}`);
    return response.data;
  },

  async getWorkoutSummary(workoutId: number): Promise<WorkoutSummary> {
    const response = await api.get(`/workouts/${workoutId}/summary`);
    return response.data;
  },

  // Notes management
  async updateWorkoutNotes(workoutId: number, notes: string): Promise<Workout> {
    const response = await api.put(`/workouts/${workoutId}/notes`, { notes });
    return response.data;
  },

  async updateExerciseNotes(
    workoutId: number,
    exerciseId: number,
    notes: string
  ): Promise<WorkoutExercise> {
    const response = await api.put(`/workouts/${workoutId}/exercises/${exerciseId}/notes`, { notes });
    return response.data;
  }
};

// Admin workout template management
export const workoutTemplateService = {
  async createWorkoutTemplate(templateData: WorkoutTemplateCreate): Promise<WorkoutTemplate> {
    const response = await api.post('/admin/workout-templates', templateData);
    return response.data;
  },

  async getWorkoutTemplates(skip: number = 0, limit: number = 100): Promise<WorkoutTemplate[]> {
    const response = await api.get(`/admin/workout-templates?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async updateWorkoutTemplate(templateId: number, templateData: WorkoutTemplateUpdate): Promise<WorkoutTemplate> {
    const response = await api.put(`/admin/workout-templates/${templateId}`, templateData);
    return response.data;
  },

  async deleteWorkoutTemplate(templateId: number): Promise<void> {
    await api.delete(`/admin/workout-templates/${templateId}`);
  },

  async addExerciseToTemplate(
    templateId: number,
    exerciseData: WorkoutTemplateExerciseCreate
  ): Promise<WorkoutTemplateExercise> {
    const response = await api.post(`/admin/workout-templates/${templateId}/exercises`, exerciseData);
    return response.data;
  },

  async removeExerciseFromTemplate(templateId: number, exerciseId: number): Promise<void> {
    await api.delete(`/admin/workout-templates/${templateId}/exercises/${exerciseId}`);
  }
};