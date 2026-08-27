import { api } from './api';
import type { User, UserCreate, LoginCredentials, Token } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<Token> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async register(userData: UserCreate): Promise<User> {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  async verifyPassword(password: string): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      const formData = new FormData();
      formData.append('username', currentUser.email);
      formData.append('password', password);
      
      await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  },
};