import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const ProfileForm: React.FC = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        full_name: user.full_name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear messages when user starts typing
    if (success) setSuccess('');
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password fields if changing password
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        setLoading(false);
        return;
      }
    }

    try {
      // If changing password, verify current password first
      if (formData.newPassword && formData.currentPassword) {
        const isCurrentPasswordValid = await authService.verifyPassword(formData.currentPassword);
        if (!isCurrentPasswordValid) {
          setError('Current password is incorrect');
          setLoading(false);
          return;
        }
      }

      // Prepare update data
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name || undefined,
      };

      // Add password if changing
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const updatedUser = await authService.updateUser(updateData);
      
      // Update user in auth context and localStorage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Update your personal information and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
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
                Email
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

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;