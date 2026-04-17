import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import NetworkStatusBar from '../components/common/NetworkStatusBar';
import SellerStatusBar from '../components/seller/SellerStatusBar';

const POSLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SellerStatusBar />
        <NetworkStatusBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default POSLayout;
