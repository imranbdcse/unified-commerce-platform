import React, { useRef } from 'react';

const Receipt = ({ order, onClose }) => {
  const receiptRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('bn-BD', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <div ref={receiptRef} className="bg-white p-6 font-mono text-sm max-w-sm mx-auto">
        <div className="text-center border-b-2 border-gray-800 pb-3 mb-3">
          <h2 className="text-xl font-bold">UCP স্টোর</h2>
          <p className="text-xs">Unified Commerce Platform</p>
          <p className="text-xs">📞 01700-000001</p>
        </div>

        <div className="text-xs mb-3">
          <div>রসিদ নং: {order.order_number || order.orderNumber}</div>
          <div>তারিখ: {formatDate(order.created_at || new Date())}</div>
          {order.seller_name && <div>বিক্রেতা: {order.seller_name} ({order.seller_code})</div>}
          {order.customer_name && <div>গ্রাহক: {order.customer_name}</div>}
        </div>

        <table className="w-full text-xs mb-3">
          <thead>
            <tr className="border-t border-b border-gray-400">
              <th className="text-left py-1">পণ্য</th>
              <th className="text-right">পরিমাণ</th>
              <th className="text-right">মূল্য</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, i) => (
              <tr key={i}>
                <td className="py-1">{item.productName || item.product_name || item.name}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">৳{((item.price || 0) * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-400 pt-2 text-xs space-y-1">
          <div className="flex justify-between">
            <span>সাবটোটাল:</span>
            <span>৳{(order.subtotal || 0).toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>ছাড়:</span>
              <span>-৳{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-1">
            <span>মোট:</span>
            <span>৳{(order.total || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="text-center text-xs mt-4 text-gray-500">
          ধন্যবাদ আপনার কেনাকাটার জন্য!
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={handlePrint} className="btn-primary flex-1">🖨️ প্রিন্ট করুন</button>
        <button onClick={onClose} className="btn-secondary flex-1">বন্ধ করুন</button>
      </div>
    </div>
  );
};

export default Receipt;
