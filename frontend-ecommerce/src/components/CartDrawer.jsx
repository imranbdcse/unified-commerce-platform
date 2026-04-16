import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../stores/cartStore';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose} />}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">🛒 আমার কার্ট ({items.length})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🛒</div>
              <p>কার্ট খালি</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                  {item.primary_image ? <img src={item.primary_image} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                  <p className="text-red-600 font-bold text-sm mt-1">৳{(item.price * item.quantity).toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300">-</button>
                    <span className="text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300">+</button>
                    <button onClick={() => removeItem(item.id)} className="ml-2 text-red-400 hover:text-red-600 text-xs">মুছুন</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>মোট:</span>
              <span className="text-red-600">৳{getTotal().toLocaleString()}</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="btn-primary w-full block text-center py-3 text-base">
              ✅ অর্ডার করুন
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
