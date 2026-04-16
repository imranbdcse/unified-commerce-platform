import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  if (!user) return <div className="text-center py-12"><Link to="/login" className="btn-primary">লগইন করুন</Link></div>;
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">👤 আমার প্রোফাইল</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl font-bold text-red-600">{user.name?.[0]}</div>
          <div><h2 className="text-lg font-bold">{user.name}</h2><p className="text-gray-500 text-sm">{user.phone}</p></div>
        </div>
        <Link to="/orders" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 mb-3">
          <span>📋 আমার অর্ডার</span><span className="text-gray-400">→</span>
        </Link>
        <button onClick={logout} className="w-full text-red-600 py-2 border border-red-200 rounded-lg hover:bg-red-50 text-sm">লগআউট</button>
      </div>
    </div>
  );
};

export default ProfilePage;
