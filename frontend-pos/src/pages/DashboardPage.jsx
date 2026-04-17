import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const KPICard = ({ title, value, icon, color = 'blue', suffix = '' }) => (
  <div className={`card border-l-4 border-${color}-500`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{suffix}{value?.toLocaleString('bn-BD')}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboard, comp] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/daily-comparison'),
        ]);
        setData(dashboard.data);
        setComparison(comp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner text="ড্যাশবোর্ড লোড হচ্ছে..." />;

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📊 মাস্টার ড্যাশবোর্ড</h1>
        <span className="text-sm text-gray-500">রিয়েল-টাইম ডেটা</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="আজকের বিক্রয়" value={kpis.todaySales} icon="💰" color="green" suffix="৳" />
        <KPICard title="আজকের অর্ডার" value={kpis.totalOrders} icon="📋" color="blue" />
        <KPICard title="মোট গ্রাহক" value={kpis.totalCustomers} icon="👥" color="purple" />
        <KPICard title="মোট পণ্য" value={kpis.totalProducts} icon="📦" color="orange" />
        <KPICard title="অনলাইন অর্ডার" value={kpis.onlineOrders} icon="🌐" color="indigo" />
        <KPICard title="পেন্ডিং ডেলিভারি" value={kpis.pendingDeliveries} icon="🚚" color="yellow" />
        <KPICard title="কম স্টক আইটেম" value={kpis.lowStockCount} icon="⚠️" color="red" />
      </div>

      {comparison && (
        <div className="card">
          <h2 className="font-bold text-gray-700 mb-4">📅 সেলস তুলনা</h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'আজ', key: 'today', color: 'green' },
              { label: 'গতকাল', key: 'yesterday', color: 'blue' },
              { label: 'এই সপ্তাহ', key: 'this_week', color: 'purple' },
              { label: 'এই মাস', key: 'this_month', color: 'orange' },
            ].map(({ label, key, color }) => (
              <div key={key} className={`bg-${color}-50 rounded-lg p-3`}>
                <div className="text-sm text-gray-500">{label}</div>
                <div className={`text-xl font-bold text-${color}-600`}>
                  ৳{(parseFloat(comparison[key]) || 0).toLocaleString('bn-BD')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.topProducts?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-700 mb-4">🏆 আজকের সেরা পণ্য</h2>
          <div className="space-y-2">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-bold">#{i + 1}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">৳{parseFloat(p.revenue || 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{p.units_sold} পিস</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
