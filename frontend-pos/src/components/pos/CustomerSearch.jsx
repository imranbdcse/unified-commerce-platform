import React, { useState } from 'react';
import api from '../../services/api';
import useCartStore from '../../stores/cartStore';

const CustomerSearch = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { customer, setCustomer } = useCartStore();

  const handleSearch = async () => {
    if (!phone || phone.length < 11) return;
    setLoading(true);
    try {
      const result = await api.get(`/customers/search?phone=${phone}`);
      if (result.data) {
        setCustomer(result.data);
      } else {
        alert('গ্রাহক পাওয়া যায়নি');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm">
      {customer ? (
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-sm">👤 {customer.name}</span>
            <span className="text-xs text-gray-500 ml-2">{customer.phone}</span>
            <span className="text-xs text-yellow-600 ml-2">⭐ {customer.loyalty_points} পয়েন্ট</span>
          </div>
          <button onClick={() => setCustomer(null)} className="text-xs text-red-500">পরিবর্তন</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="গ্রাহকের মোবাইল নম্বর"
            className="input flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading} className="btn-primary text-sm">
            {loading ? '...' : '🔍'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
