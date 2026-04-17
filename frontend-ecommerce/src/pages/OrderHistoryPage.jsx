import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../stores/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.get(`/orders?customer_id=${user?.id}&type=online`)
      .then(r => { setOrders(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return (
    <div className="text-center py-12"><p className="mb-4 text-gray-500">অর্ডার দেখতে লগইন করুন</p><Link to="/login" className="btn-primary">লগইন করুন</Link></div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">📋 আমার অর্ডার</h1>
      {loading ? <LoadingSpinner /> : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">কোনো অর্ডার নেই</div>
      ) : orders.map(order => (
        <div key={order.id} className="card p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-mono text-sm text-gray-600">{order.order_number}</div>
              <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('bn-BD')}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">৳{parseFloat(order.total || 0).toLocaleString()}</div>
              <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
            </div>
          </div>
          {order.delivery_status && <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded">🚚 {order.delivery_status}</div>}
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryPage;
