import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SellerPerformancePage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/sellers/leaderboard?period=${period}`)
      .then(r => { setLeaderboard(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🏆 পারফরম্যান্স লিডারবোর্ড</h1>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input w-32">
          <option value="daily">আজকের</option>
          <option value="weekly">সাপ্তাহিক</option>
          <option value="monthly">মাসিক</option>
          <option value="all">সর্বকালীন</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {leaderboard.map((seller, i) => (
            <div key={seller.seller_id} className={`card flex items-center gap-4 ${i < 3 ? 'border-yellow-200 bg-yellow-50' : ''}`}>
              <div className="text-2xl w-10 text-center">{medals[i] || `#${i + 1}`}</div>
              <div className="flex-1">
                <div className="font-bold">{seller.seller_name}</div>
                <div className="text-xs text-gray-500">{seller.seller_code}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">৳{parseFloat(seller.total_sales || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-500">{seller.total_orders} অর্ডার</div>
              </div>
              <div className="text-right text-blue-600 text-sm">
                <div>কমিশন</div>
                <div className="font-bold">৳{parseFloat(seller.total_commission || 0).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerPerformancePage;
