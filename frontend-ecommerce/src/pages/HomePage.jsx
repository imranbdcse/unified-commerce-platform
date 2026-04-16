import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuthStore from '../stores/authStore';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, trendingRes, catsRes, recRes] = await Promise.all([
          api.get('/products/featured?limit=50'),
          api.get('/products/trending?limit=10'),
          api.get('/products/categories'),
          api.get('/products/recommendations?limit=8'),
        ]);
        setFeatured(featuredRes.data || []);
        setTrending(trendingRes.data || []);
        setCategories(catsRes.data || []);
        setRecommended(recRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl text-white p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">আপনার পছন্দের পণ্য</h1>
        <p className="text-red-100 mb-6">সেরা দামে, সেরা মানের পণ্য। বাংলাদেশের যেকোনো প্রান্তে দ্রুত ডেলিভারি।</p>
        <Link to="/products" className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50">
          এখনই কেনাকাটা করুন →
        </Link>
      </div>

      {categories.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">📂 ক্যাটাগরি</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`}
                className="card p-4 text-center hover:shadow-md hover:border-red-200 transition-all">
                <div className="text-2xl mb-2">📦</div>
                <div className="text-xs font-medium text-gray-700">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">🔥 ট্রেন্ডিং পণ্য</h2>
            <Link to="/products?trending=true" className="text-sm text-red-600 hover:underline">সব দেখুন →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {recommended.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isAuthenticated ? '⭐ আপনার জন্য' : '🌟 জনপ্রিয় পণ্য'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {featured.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">✨ ফিচার্ড পণ্য</h2>
            <Link to="/products?featured=true" className="text-sm text-red-600 hover:underline">সব দেখুন →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {featured.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
