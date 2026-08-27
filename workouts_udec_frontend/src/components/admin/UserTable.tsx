import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types/auth';

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  loading: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onDeleteUser,
  loading
}) => {
  const { user: currentUser } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDeleteClick = (user: User) => {
    if (deleteConfirm === user.id) {
      onDeleteUser(user);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(user.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
        <h3 className="text-lg font-medium text-gray-900">Users</h3>
        <p className="mt-1 text-sm text-gray-600">
          Manage user accounts and permissions
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name || user.username}
                      </div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_admin
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-1 min-w-0">
                    {currentUser?.id === user.id ? (
                      // Current user - show different message
                      <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                        Your Account
                      </span>
                    ) : deleteConfirm === user.id ? (
                      <>
                        <button
                          onClick={() => handleDeleteClick(user)}
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
                          onClick={() => onEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded text-sm flex-shrink-0"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
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
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserTable;