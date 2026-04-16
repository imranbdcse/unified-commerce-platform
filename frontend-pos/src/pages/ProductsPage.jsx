import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [pagination, setPagination] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: perPage, search }).toString();
      const result = await api.get(`/products?${params}`);
      setProducts(result.data || []);
      setPagination(result.pagination || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, perPage, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📦 পণ্য তালিকা</h1>
        <span className="text-sm text-gray-500">মোট: {pagination.total || 0}</span>
      </div>

      <div className="flex gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="পণ্য খুঁজুন..." className="input flex-1" />
        <select value={perPage} onChange={(e) => setPerPage(e.target.value)} className="input w-32">
          <option value="20">২০টি</option>
          <option value="50">৫০টি</option>
          <option value="100">১০০টি</option>
          <option value="200">২০০টি</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">পণ্যের নাম</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">ক্যাটাগরি</th>
                <th className="px-4 py-3 text-right">মূল্য</th>
                <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.category_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">৳{parseFloat(p.price || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
