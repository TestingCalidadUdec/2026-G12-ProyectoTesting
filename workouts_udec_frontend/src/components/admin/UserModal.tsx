import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { User, UserCreate } from '../../types/auth';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserCreate | any) => Promise<void>;
  user?: User | null;
  loading: boolean;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  loading
}) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    is_active: true,
    is_admin: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // Always empty for edit mode
        full_name: user.full_name || '',
        is_active: user.is_active ?? true,
        is_admin: user.is_admin ?? false,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        is_active: true,
        is_admin: false,
      });
    }
    setError('');
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if editing current user and trying to remove admin or make inactive
    const isCurrentUser = Boolean(user && currentUser && user.id === currentUser.id);
    if (isCurrentUser) {
      if (!formData.is_admin) {
        setError('You cannot remove admin privileges from your own account');
        return;
      }
      if (!formData.is_active) {
        setError('You cannot deactivate your own account');
        return;
      }
    }

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!user && !formData.password.trim()) {
      setError('Password is required for new users');
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to save user');
    }
  };

  if (!isOpen) return null;

  const isCurrentUser = Boolean(user && currentUser && user.id === currentUser.id);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {user ? 'Edit User' : 'Create New User'}
            {isCurrentUser && (
              <span className="ml-2 text-sm text-blue-600 font-normal">(Your Account)</span>
            )}
          </h3>
          
          {isCurrentUser && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">
                <strong>Note:</strong> You are editing your own account. For security reasons, 
                you cannot remove admin privileges or deactivate your account.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <input
                type="text"
                name="username"
                id="username"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                id="full_name"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password {!user && '*'}
                {user && <span className="text-gray-500 text-xs">(leave empty to keep current)</span>}
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                value={formData.password}
                onChange={handleChange}
                required={!user}
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
                    isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  checked={Boolean(formData.is_active)}
                  onChange={handleChange}
                  disabled={isCurrentUser}
                />
                <span className={`ml-2 text-sm ${
                  isCurrentUser ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  Active
                  {isCurrentUser && ' (cannot change)'}
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_admin"
                  className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
                    isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  checked={Boolean(formData.is_admin)}
                  onChange={handleChange}
                  disabled={isCurrentUser}
                />
                <span className={`ml-2 text-sm ${
                  isCurrentUser ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  Admin
                  {isCurrentUser && ' (cannot change)'}
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;