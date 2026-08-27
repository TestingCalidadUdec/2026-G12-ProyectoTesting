import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, UserCreate, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const tokenData = await authService.login(credentials);
      
      // Set token in localStorage first so the API interceptor can use it
      localStorage.setItem('token', tokenData.access_token);
      setToken(tokenData.access_token);
      
      // Now get the current user with the token set
      const user = await authService.getCurrentUser();
      
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: UserCreate) => {
    try {
      await authService.register(userData);
      // Try to auto-login, but don't fail if it doesn't work
      try {
        await login({ username: userData.email, password: userData.password });
      } catch (loginError) {
        // Registration succeeded, but auto-login failed
        // User can manually login instead
        console.warn('Auto-login after registration failed:', loginError);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    setUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};