import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ recipientName: user?.name || '', phone: user?.phone || '', addressLine1: '', city: '', district: '', division: 'ঢাকা', paymentMethod: 'cash_on_delivery', notes: '' });
  const [loading, setLoading] = useState(false);
  const deliveryCharge = getTotal() > 1000 ? 0 : 60;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setLoading(true);
    try {
      const result = await api.post('/orders/online', {
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        deliveryAddress: { recipientName: form.recipientName, phone: form.phone, addressLine1: form.addressLine1, city: form.city, district: form.district, division: form.division },
        notes: form.notes,
      });
      clearCart();
      navigate('/order-success', { state: { order: result.data } });
    } catch (err) {
      toast.error('অর্ডার করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📦 চেকআউট</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card p-4">
            <h2 className="font-bold mb-4">🏠 ডেলিভারি ঠিকানা</h2>
            <div className="space-y-3">
              <input value={form.recipientName} onChange={e => setForm({ ...form, recipientName: e.target.value })} placeholder="প্রাপকের নাম" className="input" required />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="মোবাইল নম্বর" className="input" required />
              <input value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} placeholder="বাড়ির ঠিকানা" className="input" required />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="শহর" className="input" required />
                <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="জেলা" className="input" required />
              </div>
              <select value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} className="input">
                {['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'ময়মনসিংহ', 'রংপুর'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="card p-4">
            <h2 className="font-bold mb-3">💳 পেমেন্ট পদ্ধতি</h2>
            <div className="space-y-2">
              {[{ id: 'cash_on_delivery', label: 'ক্যাশ অন ডেলিভারি' }, { id: 'bkash', label: 'বিকাশ' }, { id: 'nagad', label: 'নগদ' }].map(m => (
                <label key={m.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" value={m.id} checked={form.paymentMethod === m.id} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full py-3 text-base">
            {loading ? 'অর্ডার হচ্ছে...' : '✅ অর্ডার নিশ্চিত করুন'}
          </button>
        </form>
        <div className="card p-4 h-fit">
          <h2 className="font-bold mb-4">🛒 অর্ডার সারসংক্ষেপ</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="truncate max-w-48">{item.name} × {item.quantity}</span>
                <span>৳{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>পণ্যের মোট:</span><span>৳{getTotal().toLocaleString()}</span></div>
            <div className="flex justify-between"><span>ডেলিভারি:</span><span className={deliveryCharge === 0 ? 'text-green-600' : ''}>{deliveryCharge === 0 ? 'বিনামূল্যে' : `৳${deliveryCharge}`}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2"><span>মোট:</span><span className="text-red-600">৳{(getTotal() + deliveryCharge).toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
