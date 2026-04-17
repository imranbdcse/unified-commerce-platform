import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccessPage = () => {
  const { state } = useLocation();
  const order = state?.order;
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-7xl mb-6">🎉</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">অর্ডার সফল হয়েছে!</h1>
      {order && (
        <div className="card p-4 my-6 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span>অর্ডার নং:</span><span className="font-bold">{order.order_number}</span></div>
          <div className="flex justify-between"><span>মোট:</span><span className="font-bold text-red-600">৳{parseFloat(order.total || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span>স্ট্যাটাস:</span><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">প্রসেসিং</span></div>
        </div>
      )}
      <p className="text-gray-500 mb-6">আপনার অর্ডার প্রসেস হচ্ছে। শীঘ্রই ডেলিভারি হবে।</p>
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="btn-outline">আমার অর্ডার</Link>
        <Link to="/" className="btn-primary">আরও কেনাকাটা করুন</Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
