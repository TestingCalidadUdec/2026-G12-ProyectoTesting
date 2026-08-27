import { api } from './api';
import type { User, UserCreate, UserUpdate } from '../types/auth';

export const adminService = {
  // User Management
  async getUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    const response = await api.get(`/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async createUser(userData: UserCreate): Promise<User> {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  // Workout Templates (for future use)
  async getWorkoutTemplates(skip: number = 0, limit: number = 100): Promise<any[]> {
    const response = await api.get(`/admin/workout-templates?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};