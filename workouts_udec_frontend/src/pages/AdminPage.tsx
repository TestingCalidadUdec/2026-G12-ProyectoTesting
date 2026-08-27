import React, { useState } from 'react';
import Layout from '../components/ui/Layout';
import AdminDashboard from '../components/admin/AdminDashboard';
import ExerciseManagement from '../components/admin/ExerciseManagement';
import WorkoutTemplateManagement from '../components/admin/WorkoutTemplateManagement';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'exercises' | 'templates'>('users');

  const tabs = [
    { id: 'users' as const, name: 'User Management', icon: '👥' },
    { id: 'exercises' as const, name: 'Exercise Management', icon: '💪' },
    { id: 'templates' as const, name: 'Workout Templates', icon: '📋' },
  ];

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && <AdminDashboard />}
        {activeTab === 'exercises' && <ExerciseManagement />}
        {activeTab === 'templates' && <WorkoutTemplateManagement />}
      </div>
    </Layout>
  );
};

export default AdminPage;