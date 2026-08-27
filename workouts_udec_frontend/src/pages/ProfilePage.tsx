import React from 'react';
import Layout from '../components/ui/Layout';
import ProfileForm from '../components/profile/ProfileForm';

const ProfilePage: React.FC = () => {
  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <ProfileForm />
      </div>
    </Layout>
  );
};

export default ProfilePage;