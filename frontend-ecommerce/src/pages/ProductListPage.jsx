import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [view, setView] = useState('grid');
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '20');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'DESC';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, per_page: perPage, search, category, sort, order }).toString();
        const result = await api.get(`/products?${params}`);
        setProducts(result.data || []);
        setPagination(result.pagination || {});
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [page, perPage, search, category, sort, order]);

  const updateFilter = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) { params[key] = value; params.page = '1'; }
    else delete params[key];
    setSearchParams(params);
  };

  return (
    <div className="flex gap-6">
      <div className="w-56 flex-shrink-0">
        <div className="card p-4 sticky top-20">
          <h3 className="font-bold text-gray-800 mb-4">🔧 ফিল্টার</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">মূল্য পরিসর</label>
              <div className="flex gap-2">
                <input type="number" placeholder="কম" className="input text-xs" onChange={(e) => updateFilter('min_price', e.target.value)} />
                <input type="number" placeholder="বেশি" className="input text-xs" onChange={(e) => updateFilter('max_price', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            মোট {pagination.total || 0} পণ্য {search && `"${search}" এর ফলাফল`}
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input w-36 text-xs">
              <option value="created_at">সর্বশেষ</option>
              <option value="price">মূল্য (কম)</option>
              <option value="purchase_count">জনপ্রিয়</option>
            </select>
            <select value={perPage} onChange={(e) => updateFilter('per_page', e.target.value)} className="input w-24 text-xs">
              <option value="20">২০টি</option>
              <option value="50">৫০টি</option>
              <option value="100">১০০টি</option>
              <option value="200">২০০টি</option>
            </select>
            <div className="flex gap-1">
              <button onClick={() => setView('grid')} className={`px-2 py-1 rounded text-sm ${view === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>⊞</button>
              <button onClick={() => setView('list')} className={`px-2 py-1 rounded text-sm ${view === 'list' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>≡</button>
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'space-y-3'}>
              {products.map((p) => <ProductCard key={p.id} product={p} view={view} />)}
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.min(5, pagination.total_pages || 1) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => updateFilter('page', p)}
                    className={`px-3 py-1 rounded text-sm ${page === p ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {p}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
