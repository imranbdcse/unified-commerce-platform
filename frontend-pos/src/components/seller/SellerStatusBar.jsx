import React, { useState } from 'react';
import useSellerStore from '../../stores/sellerStore';
import SellerLoginModal from './SellerLoginModal';

const SellerStatusBar = () => {
  const { currentSeller, clearSeller } = useSellerStore();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <div className="bg-indigo-900 text-white px-4 py-1 text-sm flex items-center justify-between">
        {currentSeller ? (
          <div className="flex items-center gap-3">
            <span>🏪 বিক্রেতা: <strong>{currentSeller.name}</strong> ({currentSeller.sellerCode})</span>
            <button onClick={clearSeller} className="text-indigo-300 hover:text-white text-xs">পরিবর্তন</button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="text-indigo-300 hover:text-white">
            + বিক্রেতা যুক্ত করুন
          </button>
        )}
      </div>
      <SellerLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default SellerStatusBar;
