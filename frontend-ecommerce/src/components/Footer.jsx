import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-12">
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <h3 className="font-bold text-white mb-3">🛍️ UCP Store</h3>
        <p className="text-sm">বাংলাদেশের সেরা অনলাইন শপিং প্ল্যাটফর্ম</p>
      </div>
      <div>
        <h4 className="font-medium text-white mb-3">দ্রুত লিংক</h4>
        <div className="space-y-2 text-sm">
          <div><Link to="/products" className="hover:text-white">সব পণ্য</Link></div>
          <div><Link to="/orders" className="hover:text-white">আমার অর্ডার</Link></div>
          <div><Link to="/profile" className="hover:text-white">প্রোফাইল</Link></div>
        </div>
      </div>
      <div>
        <h4 className="font-medium text-white mb-3">যোগাযোগ</h4>
        <div className="text-sm space-y-1">
          <div>📞 01700-000001</div>
          <div>📧 support@unified.com</div>
          <div>🕐 সকাল ৯টা - রাত ১০টা</div>
        </div>
      </div>
    </div>
    <div className="border-t border-gray-700 text-center py-3 text-xs text-gray-500">
      © 2026 Unified Commerce Platform. All rights reserved.
    </div>
  </footer>
);

export default Footer;
