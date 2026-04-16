import React, { useState } from 'react';
import Modal from '../common/Modal';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'নগদ', icon: '💵' },
  { id: 'card', label: 'কার্ড', icon: '💳' },
  { id: 'bkash', label: 'বিকাশ', icon: '📱' },
  { id: 'nagad', label: 'নগদ (MFS)', icon: '📲' },
];

const PaymentModal = ({ isOpen, onClose, total, onConfirm }) => {
  const [payments, setPayments] = useState([{ method: 'cash', amount: total }]);
  const [cashReceived, setCashReceived] = useState(total);

  const totalPaid = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const change = Math.max(0, cashReceived - total);
  const remaining = total - totalPaid;

  const updatePayment = (index, field, value) => {
    setPayments(payments.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPayment = () => {
    setPayments([...payments, { method: 'bkash', amount: remaining }]);
  };

  const removePayment = (index) => {
    if (payments.length > 1) setPayments(payments.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (remaining > 0) {
      alert('মোট পেমেন্ট পরিমাণ কম');
      return;
    }
    onConfirm(payments, change);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💳 পেমেন্ট" size="md">
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">৳ {total.toLocaleString('bn-BD')}</div>
          <div className="text-sm text-gray-500 mt-1">মোট পরিশোধযোগ্য</div>
        </div>

        {payments.map((payment, index) => (
          <div key={index} className="flex gap-3 items-center">
            <select
              value={payment.method}
              onChange={(e) => updatePayment(index, 'method', e.target.value)}
              className="input flex-shrink-0 w-36"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
              ))}
            </select>
            <input
              type="number"
              value={payment.amount}
              onChange={(e) => {
                updatePayment(index, 'amount', e.target.value);
                if (payment.method === 'cash') setCashReceived(parseFloat(e.target.value) || 0);
              }}
              className="input flex-1"
              placeholder="পরিমাণ"
            />
            {payments.length > 1 && (
              <button onClick={() => removePayment(index)} className="text-red-500 hover:text-red-700">✕</button>
            )}
          </div>
        ))}

        {remaining > 0 && (
          <button onClick={addPayment} className="text-sm text-blue-600 hover:underline">+ আরেকটি পেমেন্ট মেথড যোগ করুন</button>
        )}

        {payments.some(p => p.method === 'cash') && (
          <div className="bg-green-50 rounded-lg p-3 flex justify-between">
            <span className="text-gray-600">ভাংতি:</span>
            <span className="text-2xl font-bold text-green-600">৳ {change.toLocaleString('bn-BD')}</span>
          </div>
        )}

        {remaining > 0 && (
          <div className="bg-red-50 rounded-lg p-3 flex justify-between">
            <span className="text-gray-600">বাকি:</span>
            <span className="text-xl font-bold text-red-600">৳ {remaining.toLocaleString('bn-BD')}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary">বাতিল</button>
          <button onClick={handleConfirm} className="btn-success" disabled={remaining > 0}>
            ✅ নিশ্চিত করুন
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
