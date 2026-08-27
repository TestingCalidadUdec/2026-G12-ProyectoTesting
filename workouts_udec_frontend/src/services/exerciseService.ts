import { api } from './api';
import type { Exercise, ExerciseCreate, ExerciseUpdate } from '../types/exercise';

export const exerciseService = {
  async getExercises(skip: number = 0, limit: number = 100): Promise<Exercise[]> {
    const response = await api.get(`/exercises?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getExercise(exerciseId: number): Promise<Exercise> {
    const response = await api.get(`/exercises/${exerciseId}`);
    return response.data;
  },

  async createExercise(exerciseData: ExerciseCreate): Promise<Exercise> {
    const response = await api.post('/exercises', exerciseData);
    return response.data;
  },

  async updateExercise(exerciseId: number, exerciseData: ExerciseUpdate): Promise<Exercise> {
    const response = await api.put(`/exercises/${exerciseId}`, exerciseData);
    return response.data;
  },

  async deleteExercise(exerciseId: number): Promise<void> {
    await api.delete(`/exercises/${exerciseId}`);
  },
};