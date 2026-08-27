import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import UserTable from './UserTable';
import UserModal from './UserModal';
import UserFilters from './UserFilters';
import type { User, UserCreate } from '../../types/auth';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error: any) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSaveUser = async (userData: UserCreate | any) => {
    setModalLoading(true);
    setError('');

    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = await adminService.updateUser(editingUser.id, userData);
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
        setSuccess('User updated successfully');
      } else {
        // Create new user
        const newUser = await adminService.createUser(userData as UserCreate);
        setUsers([...users, newUser]);
        setSuccess('User created successfully');
      }
      setShowModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      throw error; // Let UserModal handle the error display
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await adminService.deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRoleFilter('');
  };

  // Filter users based on current filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.full_name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter) {
        const isActive = statusFilter === 'active';
        if (user.is_active !== isActive) {
          return false;
        }
      }

      // Role filter
      if (roleFilter) {
        const isAdmin = roleFilter === 'admin';
        if (user.is_admin !== isAdmin) {
          return false;
        }
      }

      return true;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Calculate statistics based on filtered results
  const stats = {
    total: filteredUsers.length,
    active: filteredUsers.filter(u => u.is_active).length,
    admins: filteredUsers.filter(u => u.is_admin).length,
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage user accounts, permissions, and access levels.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </button>
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

      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        role={roleFilter}
        onRoleChange={setRoleFilter}
        onClearFilters={handleClearFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <UserTable
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            loading={loading}
          />
        </div>
      </div>

      <UserModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={editingUser}
        loading={modalLoading}
      />
    </div>
  );
};

export default AdminDashboard;