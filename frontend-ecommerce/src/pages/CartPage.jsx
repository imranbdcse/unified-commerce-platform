import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../stores/cartStore';

const CartPage = () => {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const deliveryCharge = getTotal() > 1000 ? 0 : 60;
  const totalWithDelivery = getTotal() + deliveryCharge;
  // Calculate installment amount for total (divide by 3, round up to nearest whole number)
  const installmentAmount = Math.ceil(totalWithDelivery / 3);

  if (items.length === 0) return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-xl font-bold text-gray-700 mb-4">কার্ট খালি</h2>
      <Link to="/products" className="btn-primary">কেনাকাটা শুরু করুন</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">🛒 আমার কার্ট ({items.length})</h1>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="card p-4 flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
              {item.primary_image ? <img src={item.primary_image} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : '📦'}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-red-600 font-bold">৳{item.price?.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 bg-gray-100">-</button>
                <span className="px-3 py-1">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 bg-gray-100">+</button>
              </div>
              <span className="font-bold w-24 text-right">৳{(item.price * item.quantity).toLocaleString()}</span>
              <button onClick={() => removeItem(item.id)} className="text-red-500">🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-4 space-y-2">
        <div className="flex justify-between text-sm"><span>পণ্যের মোট:</span><span>৳{getTotal().toLocaleString()}</span></div>
        <div className="flex justify-between text-sm"><span>ডেলিভারি:</span><span className={deliveryCharge === 0 ? 'text-green-600' : ''}>{deliveryCharge === 0 ? 'বিনামূল্যে' : `৳${deliveryCharge}`}</span></div>
        <div className="flex justify-between font-bold text-lg border-t pt-2"><span>সর্বমোট:</span><span className="text-red-600">৳{totalWithDelivery.toLocaleString()}</span></div>
        {/* Baadmay Installment Option for cart total >= 1000 */}
        {totalWithDelivery >= 1000 && (
          <div className="flex items-center justify-center gap-2 bg-gray-50 p-2 rounded-lg mt-2">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">baadmay</span>
            <span className="text-sm text-gray-700">
              Pay in 3 Installments of <span className="font-bold text-green-600">৳{installmentAmount.toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>
      <Link to="/checkout" className="btn-primary w-full block text-center py-3 text-base">অর্ডার করুন →</Link>
    </div>
  );
};

export default CartPage;
