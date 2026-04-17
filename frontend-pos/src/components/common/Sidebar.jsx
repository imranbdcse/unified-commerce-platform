import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const navItems = [
  { path: '/dashboard', label: 'ড্যাশবোর্ড', icon: '📊' },
  { path: '/pos', label: 'POS বিক্রয়', icon: '🛒' },
  { path: '/orders', label: 'অর্ডার', icon: '📋' },
  { path: '/products', label: 'পণ্য', icon: '📦' },
  { path: '/inventory', label: 'স্টক', icon: '🏪' },
  { path: '/customers', label: 'গ্রাহক', icon: '👥' },
  { path: '/sellers', label: 'বিক্রেতা', icon: '🏆' },
  { path: '/seller-performance', label: 'পারফরম্যান্স', icon: '📈' },
  { path: '/zones', label: 'জোন ম্যাপ', icon: '🗺️' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">UCP POS</h1>
        <p className="text-xs text-slate-400 mt-1">Unified Commerce Platform</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 mb-2">{user?.name}</div>
        <button
          onClick={logout}
          className="w-full text-sm text-red-400 hover:text-red-300 py-1 text-left"
        >
          🚪 লগআউট
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
