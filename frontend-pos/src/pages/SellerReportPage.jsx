import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SellerReportPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sellers').then(r => { setSellers(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">🏷️ বিক্রেতা রিপোর্ট</h1>
      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">নাম</th>
                <th className="px-4 py-3 text-left">কোড</th>
                <th className="px-4 py-3 text-right">অর্ডার</th>
                <th className="px-4 py-3 text-right">বিক্রয়</th>
                <th className="px-4 py-3 text-right">কমিশন</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sellers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm">{s.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-blue-600">{s.seller_code}</td>
                  <td className="px-4 py-3 text-right text-sm">{s.total_orders}</td>
                  <td className="px-4 py-3 text-right font-bold text-sm">৳{parseFloat(s.total_sales || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm text-green-600">৳{parseFloat(s.total_commission || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerReportPage;
