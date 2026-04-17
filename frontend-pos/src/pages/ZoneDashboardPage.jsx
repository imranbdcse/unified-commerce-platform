import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ZoneDashboardPage = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeTab, setActiveTab] = useState('sales');
  const [tabData, setTabData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    api.get('/zones').then(r => { setZones(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const loadTabData = async (zoneId, tab) => {
    setTabLoading(true);
    try {
      const endpoint = tab === 'sales' ? `/zones/${zoneId}/sales` : tab === 'stock' ? `/zones/${zoneId}/stock` : `/zones/${zoneId}/online-orders`;
      const result = await api.get(endpoint);
      setTabData(result.data || []);
    } catch (err) { console.error(err); }
    finally { setTabLoading(false); }
  };

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    loadTabData(zone.id, activeTab);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (selectedZone) loadTabData(selectedZone.id, tab);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">🗺️ জোন ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading ? <LoadingSpinner /> : zones.map((zone) => (
          <div
            key={zone.id}
            onClick={() => handleZoneSelect(zone)}
            className={`card cursor-pointer hover:shadow-md transition-all ${selectedZone?.id === zone.id ? 'border-blue-400 bg-blue-50' : ''}`}
          >
            <div className="font-bold text-sm">{zone.name}</div>
            <div className="text-xs text-gray-500 mt-1">{zone.code}</div>
            <div className="mt-2 text-xs">
              <div>🏪 {zone.store_count || 0} স্টোর</div>
              <div className="text-green-600 font-bold">৳{parseFloat(zone.today_sales || 0).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedZone && (
        <div className="card">
          <h2 className="font-bold mb-4">{selectedZone.name} বিস্তারিত</h2>
          <div className="flex gap-2 mb-4">
            {['sales', 'stock', 'online'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 text-sm rounded-lg ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                {tab === 'sales' ? '💰 বিক্রয়' : tab === 'stock' ? '📦 স্টক' : '🌐 অনলাইন'}
              </button>
            ))}
          </div>

          {tabLoading ? <LoadingSpinner size="sm" /> : (
            <div className="space-y-2">
              {tabData.map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b last:border-0 text-sm">
                  <span>{item.store_name || item.order_number || '-'}</span>
                  <span className="font-bold">
                    {activeTab === 'sales' ? `৳${parseFloat(item.total_sales || 0).toLocaleString()}` :
                     activeTab === 'stock' ? `${item.total_stock || 0} পিস` :
                     item.status}
                  </span>
                </div>
              ))}
              {tabData.length === 0 && <p className="text-gray-500 text-sm text-center py-4">কোনো ডেটা নেই</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ZoneDashboardPage;
