import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../stores/cartStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product, view = 'grid' }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name.substring(0, 30)}... কার্টে যোগ হয়েছে`);
  };

  const discount = product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  // Calculate installment amount (divide by 3, round up to nearest whole number)
  const installmentAmount = Math.ceil(product.price / 3);

  if (view === 'list') {
    return (
      <Link to={`/products/${product.id}`} className="card p-4 flex gap-4 hover:shadow-md transition-all">
        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
          {product.primary_image ? <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover rounded-lg" /> : '📦'}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold">৳{product.price?.toLocaleString()}</span>
            {product.compare_price > product.price && (
              <span className="text-gray-400 line-through text-sm">৳{product.compare_price?.toLocaleString()}</span>
            )}
          </div>
        </div>
        <button onClick={handleAddToCart} className="btn-primary text-sm self-center">কার্টে যোগ</button>
      </Link>
    );
  }

  return (
    <Link to={`/products/${product.id}`} className="card hover:shadow-md transition-all group block">
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="h-48 bg-gray-100 flex items-center justify-center text-4xl">
          {product.primary_image
            ? <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            : '📦'
          }
        </div>
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
            -{discount}%
          </span>
        )}
        {product.is_featured && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-gray-800 text-xs px-2 py-1 rounded-full font-bold">★ ফিচার্ড</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-600 font-bold">৳{product.price?.toLocaleString()}</span>
          {product.compare_price > product.price && (
            <span className="text-gray-400 line-through text-xs">৳{product.compare_price?.toLocaleString()}</span>
          )}
        </div>
        {/* Baadmay Installment Option for products >= 1000 */}
        {product.price >= 1000 && (
          <div className="flex items-center gap-1 mb-2 text-xs">
            <span className="bg-green-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">baadmay</span>
            <span className="text-gray-600">3x ৳{installmentAmount.toLocaleString()}</span>
          </div>
        )}
        <button onClick={handleAddToCart} className="w-full btn-primary text-sm py-2">
          🛒 কার্টে যোগ করুন
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
