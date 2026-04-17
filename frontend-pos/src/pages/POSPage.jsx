import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getCachedProducts, cacheProducts } from '../services/offlineDB';
import { createOfflineOrder } from '../services/offlineOrderService';
import { isOnline } from '../services/networkStatus';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import useSellerStore from '../stores/sellerStore';
import PaymentModal from '../components/pos/PaymentModal';
import Receipt from '../components/pos/Receipt';
import CustomerSearch from '../components/pos/CustomerSearch';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const { items, addItem, removeItem, updateQuantity, getSubtotal, getTotal, getItemCount, customer, discount, setDiscount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { currentSeller } = useSellerStore();

  const loadProducts = useCallback(async () => {
    try {
      if (isOnline()) {
        const result = await api.get('/products?per_page=200');
        const prods = result.data || [];
        setProducts(prods);
        await cacheProducts(prods);
      } else {
        const cached = await getCachedProducts();
        setProducts(cached);
      }
    } catch (err) {
      const cached = await getCachedProducts();
      setProducts(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filteredProducts = products.filter((p) =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode === search
  );

  const handlePaymentConfirm = async (payments, change) => {
    const orderData = {
      items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      customerId: customer?.id,
      storeId: user?.storeId,
      sellerId: currentSeller?.id,
      payments,
      discount,
      notes: null,
    };

    try {
      let order;
      if (isOnline()) {
        const result = await api.post('/orders/pos', orderData);
        order = { ...result.data, items: items.map(i => ({ ...i, productName: i.name })), seller_name: currentSeller?.name, seller_code: currentSeller?.sellerCode };
        toast.success('অর্ডার সম্পন্ন হয়েছে!');
      } else {
        order = await createOfflineOrder({ ...orderData, items: items, subtotal: getSubtotal(), total: getTotal() });
        toast.success('অফলাইনে সংরক্ষিত হয়েছে');
      }

      setLastOrder(order);
      setShowPayment(false);
      setShowReceipt(true);
      clearCart();
    } catch (err) {
      toast.error('অর্ডার তৈরিতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="পণ্য খুঁজুন (নাম / SKU / বারকোড)..."
            className="input flex-1"
          />
        </div>

        <CustomerSearch />

        {loading ? (
          <div className="text-center py-12 text-gray-500">লোড হচ্ছে...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addItem(product)}
                className="card cursor-pointer hover:shadow-md hover:border-blue-200 transition-all active:scale-95"
              >
                <div className="bg-gray-100 rounded-lg h-24 flex items-center justify-center mb-2 text-3xl">
                  {product.primary_image ? (
                    <img src={product.primary_image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                  ) : '📦'}
                </div>
                <div className="text-xs font-medium text-gray-800 line-clamp-2">{product.name}</div>
                <div className="text-sm font-bold text-blue-600 mt-1">৳{product.price?.toLocaleString()}</div>
                <div className="text-xs text-gray-400">{product.sku}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart */}
      <div className="w-80 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">🛒 কার্ট ({getItemCount()})</h2>
          {items.length > 0 && (
            <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700">সব মুছুন</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">🛒</div>
              <div className="text-sm">পণ্য যোগ করুন</div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{item.name}</div>
                  <div className="text-xs text-blue-600">৳{item.price?.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300">-</button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t space-y-3">
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">ছাড়:</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="input flex-1 text-sm py-1"
              placeholder="0"
            />
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>সাবটোটাল:</span>
              <span>৳{getSubtotal().toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>ছাড়:</span>
                <span>-৳{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>মোট:</span>
              <span className="text-blue-600">৳{getTotal().toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            disabled={items.length === 0}
            className="btn-success w-full py-3 text-base disabled:opacity-50"
          >
            💳 পেমেন্ট করুন
          </button>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        total={getTotal()}
        onConfirm={handlePaymentConfirm}
      />

      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="রসিদ" size="sm">
        {lastOrder && <Receipt order={lastOrder} onClose={() => setShowReceipt(false)} />}
      </Modal>
    </div>
  );
};

export default POSPage;
