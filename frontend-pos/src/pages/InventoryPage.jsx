import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuthStore from '../stores/authStore';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { user } = useAuthStore();

  const storeId = user?.storeId || 'b1c2d3e4-0001-0001-0001-000000000001';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = lowStockOnly ? '?low_stock=true' : '';
        const result = await api.get(`/inventory/store/${storeId}${params}`);
        setInventory(result.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [storeId, lowStockOnly]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🏪 স্টক ম্যানেজমেন্ট</h1>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          কম স্টক দেখান
        </label>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">পণ্য</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-center">স্টক</th>
                <th className="px-4 py-3 text-center">ন্যূনতম স্টক</th>
                <th className="px-4 py-3 text-center">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map((item) => {
                const isLow = item.quantity <= item.min_stock_level;
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${isLow ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium">{item.product_name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{item.sku}</td>
                    <td className="px-4 py-3 text-center font-bold text-lg">{item.quantity}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{item.min_stock_level}</td>
                    <td className="px-4 py-3 text-center">
                      {isLow ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">⚠️ কম</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">✅ ঠিক আছে</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
