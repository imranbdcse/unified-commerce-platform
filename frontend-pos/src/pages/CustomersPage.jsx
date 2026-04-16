import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await api.get(`/customers?search=${search}`);
        setCustomers(result.data || []);
        setPagination(result.pagination || {});
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">👥 গ্রাহক তালিকা</h1>
        <span className="text-sm text-gray-500">মোট: {pagination.total || 0}</span>
      </div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম বা ফোন দিয়ে খুঁজুন..." className="input" />
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="card hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {c.name?.[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.phone}</div>
                </div>
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-500">
                <span>⭐ {c.loyalty_points} পয়েন্ট</span>
                <span>📋 {c.total_orders} অর্ডার</span>
                <span>৳{parseFloat(c.total_spent || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
