import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  processing: 'bg-blue-100 text-blue-700',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, per_page: 20, ...filters }).toString();
        const result = await api.get(`/orders?${params}`);
        setOrders(result.data || []);
        setPagination(result.pagination || {});
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [page, filters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📋 অর্ডার তালিকা</h1>
        <span className="text-sm text-gray-500">মোট: {pagination.total || 0}</span>
      </div>

      <div className="flex gap-3">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input w-40">
          <option value="">সব স্ট্যাটাস</option>
          <option value="pending">পেন্ডিং</option>
          <option value="completed">সম্পন্ন</option>
          <option value="cancelled">বাতিল</option>
        </select>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="input w-32">
          <option value="">সব ধরন</option>
          <option value="pos">POS</option>
          <option value="online">অনলাইন</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">অর্ডার নং</th>
                <th className="px-4 py-3 text-left">ধরন</th>
                <th className="px-4 py-3 text-left">গ্রাহক</th>
                <th className="px-4 py-3 text-right">মোট</th>
                <th className="px-4 py-3 text-left">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-left">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{order.order_number}</td>
                  <td className="px-4 py-3 text-sm">{order.type === 'pos' ? '🏪 POS' : '🌐 অনলাইন'}</td>
                  <td className="px-4 py-3 text-sm">{order.customer_name || 'অনামী'}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold">৳{parseFloat(order.total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('bn-BD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm">← আগে</button>
        <span className="text-sm text-gray-600 self-center">পৃষ্ঠা {page} / {Math.ceil((pagination.total || 0) / 20)}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil((pagination.total || 0) / 20)} className="btn-secondary text-sm">পরে →</button>
      </div>
    </div>
  );
};

export default OrdersPage;
