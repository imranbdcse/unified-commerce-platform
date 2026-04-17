import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', email: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/customer/register', { name: form.name, phone: form.phone, email: form.email });
      setStep(2);
      toast.success('OTP পাঠানো হয়েছে');
    } catch (err) { toast.error(err.message || 'সমস্যা হয়েছে'); }
    finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.post('/auth/customer/verify-otp', { phone: form.phone, otp: form.otp, name: form.name, email: form.email });
      login(result.data.customer, result.data.accessToken);
      navigate('/');
      toast.success('রেজিস্ট্রেশন সম্পন্ন!');
    } catch (err) { toast.error(err.message || 'OTP ভুল'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-sm mx-auto py-12">
      <div className="card p-8">
        <div className="text-center mb-6"><div className="text-4xl mb-3">📝</div><h1 className="text-xl font-bold">নতুন অ্যাকাউন্ট</h1></div>
        {step === 1 ? (
          <form onSubmit={sendOTP} className="space-y-4">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="আপনার নাম" className="input" required />
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="মোবাইল নম্বর" className="input" required />
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ইমেইল (ঐচ্ছিক)" className="input" />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠান'}</button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} className="space-y-4">
            <p className="text-sm text-center text-gray-600">{form.phone} নম্বরে OTP পাঠানো হয়েছে</p>
            <input value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} placeholder="6 সংখ্যার OTP" maxLength={6} className="input text-center text-2xl tracking-widest" required />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'যাচাই হচ্ছে...' : '✅ নিশ্চিত করুন'}</button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-gray-500">
          অ্যাকাউন্ট আছে? <Link to="/login" className="text-red-600 hover:underline">লগইন করুন</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
