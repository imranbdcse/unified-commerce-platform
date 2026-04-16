import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/customer/login', { phone });
      setOtpSent(true);
      toast.success('OTP পাঠানো হয়েছে');
    } catch (err) {
      toast.error(err.message || 'OTP পাঠাতে সমস্যা');
    } finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.post('/auth/customer/verify-login', { phone, otp });
      login(result.data.customer, result.data.accessToken);
      navigate('/');
      toast.success('লগইন সফল');
    } catch (err) {
      toast.error(err.message || 'OTP ভুল');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-sm mx-auto py-12">
      <div className="card p-8">
        <div className="text-center mb-8"><div className="text-4xl mb-3">🔐</div><h1 className="text-2xl font-bold">লগইন করুন</h1></div>
        {!otpSent ? (
          <form onSubmit={sendOTP} className="space-y-4">
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="input" required />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'পাঠানো হচ্ছে...' : '📱 OTP পাঠান'}</button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} className="space-y-4">
            <p className="text-sm text-center text-gray-600">{phone} নম্বরে OTP পাঠানো হয়েছে</p>
            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6 সংখ্যার OTP" maxLength={6} className="input text-center text-2xl tracking-widest" required />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'যাচাই হচ্ছে...' : '✅ যাচাই করুন'}</button>
            <button type="button" onClick={() => setOtpSent(false)} className="text-sm text-gray-500 w-full text-center hover:underline">নম্বর পরিবর্তন</button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-gray-500">
          নতুন? <Link to="/register" className="text-red-600 hover:underline">রেজিস্ট্রেশন করুন</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
