import React, { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import useSellerStore from '../../stores/sellerStore';

const SellerLoginModal = ({ isOpen, onClose }) => {
  const [sellerCode, setSellerCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setSeller } = useSellerStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.post('/sellers/verify', { sellerCode, pin });
      setSeller(result.data);
      onClose();
    } catch (err) {
      setError(err.message || 'ভুল কোড বা PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏪 বিক্রেতা লগইন" size="sm">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">বিক্রেতা কোড</label>
          <input
            type="text"
            value={sellerCode}
            onChange={(e) => setSellerCode(e.target.value.toUpperCase())}
            placeholder="SEL-001"
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="6-digit PIN"
            maxLength={6}
            className="input"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'লগইন হচ্ছে...' : '✅ লগইন করুন'}
        </button>
      </form>
    </Modal>
  );
};

export default SellerLoginModal;
