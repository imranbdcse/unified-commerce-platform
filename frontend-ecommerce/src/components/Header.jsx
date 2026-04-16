import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import CartDrawer from './CartDrawer';

const Header = () => {
  const [search, setSearch] = useState('');
  const [showCart, setShowCart] = useState(false);
  const { getCount } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${search}`);
  };

  return (
    <>
      <header className="bg-red-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            <Link to="/" className="text-xl font-bold whitespace-nowrap">🛍️ UCP Store</Link>

            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                className="flex-1 px-4 py-2 rounded-lg text-gray-800 text-sm"
              />
              <button type="submit" className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg font-medium hover:bg-yellow-300 text-sm">
                🔍 খুঁজুন
              </button>
            </form>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="text-sm hover:text-yellow-200">👤 {user?.name}</Link>
                  <button onClick={logout} className="text-xs text-red-200 hover:text-white">লগআউট</button>
                </div>
              ) : (
                <Link to="/login" className="text-sm hover:text-yellow-200">লগইন</Link>
              )}

              <button
                onClick={() => setShowCart(true)}
                className="relative bg-yellow-400 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-300"
              >
                🛒 কার্ট
                {getCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {getCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          <nav className="flex gap-4 py-2 text-sm border-t border-red-500 overflow-x-auto">
            {['ইলেকট্রনিক্স', 'মোবাইল', 'কম্পিউটার', 'হোম অ্যাপ্লায়েন্স', 'ফ্যাশন'].map((cat) => (
              <Link key={cat} to={`/products?category=${cat}`} className="whitespace-nowrap hover:text-yellow-200">{cat}</Link>
            ))}
          </nav>
        </div>
      </header>

      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default Header;
