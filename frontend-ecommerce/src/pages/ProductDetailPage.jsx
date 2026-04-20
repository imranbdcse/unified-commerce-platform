import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import useCartStore from '../stores/cartStore';
import toast from 'react-hot-toast';
import { BAADMAY_CONFIG, calculateInstallmentAmount } from '../constants/payment';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [alsoBought, setAlsoBought] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, similarRes, alsoRes, recRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/similar?limit=4`),
          api.get(`/products/${id}/also-bought?limit=4`),
          api.get('/products/recommendations?limit=4'),
        ]);
        setProduct(productRes.data);
        setSimilar(similarRes.data || []);
        setAlsoBought(alsoRes.data || []);
        setRecommended(recRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = () => { addItem(product, quantity); toast.success('কার্টে যোগ হয়েছে!'); };
  const handleBuyNow = () => { addItem(product, quantity); navigate('/checkout'); };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-12">পণ্য পাওয়া যায়নি</div>;

  const discount = product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;

  // Calculate installment amount using shared utility
  const installmentAmount = calculateInstallmentAmount(product.price);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center text-6xl">
          {(product.images || []).find(i => i && i.is_primary) ? (
            <img src={product.images.find(i => i && i.is_primary).url} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
          ) : '📦'}
        </div>
        <div className="space-y-4">
          <div>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">{product.category_name}</span>
            {product.brand && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded ml-2">{product.brand}</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-red-600">৳{product.price?.toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-gray-400 line-through">৳{product.compare_price?.toLocaleString()}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded">-{discount}%</span>
              </>
            )}
          </div>
          {/* Baadmay Installment Payment Option */}
          {product.price >= BAADMAY_CONFIG.MIN_PRICE_THRESHOLD && (
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">baadmay</span>
              <span className="text-sm text-gray-700">
                {BAADMAY_CONFIG.NUM_INSTALLMENTS} কিস্তিতে পরিশোধ করুন <span className="font-bold text-green-600">৳{installmentAmount.toLocaleString()}</span>
              </span>
            </div>
          )}
          {product.description && <p className="text-gray-600 text-sm">{product.description}</p>}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">পরিমাণ:</label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 bg-gray-100 hover:bg-gray-200">-</button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200">+</button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddToCart} className="btn-outline flex-1 py-3">🛒 কার্টে যোগ করুন</button>
            <button onClick={handleBuyNow} className="btn-primary flex-1 py-3">⚡ এখনই কিনুন</button>
          </div>
        </div>
      </div>
      {alsoBought.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">🛍️ এর সাথে অন্যরা কিনেছেন</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{alsoBought.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      )}
      {similar.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">🔍 মিল পণ্য</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{similar.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      )}
      {recommended.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">⭐ আপনার জন্য বিশেষ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{recommended.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
