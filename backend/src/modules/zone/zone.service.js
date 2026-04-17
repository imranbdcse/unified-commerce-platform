const { query } = require('../../config/database');

const getAllZones = async () => {
  const result = await query(
    `SELECT z.*, 
     COUNT(DISTINCT s.id) as store_count,
     COALESCE(SUM(i.quantity), 0) as total_stock,
     COALESCE((SELECT SUM(o.total) FROM orders o JOIN stores st ON st.id = o.store_id WHERE st.zone_id = z.id AND DATE(o.created_at) = CURRENT_DATE), 0) as today_sales
     FROM zones z
     LEFT JOIN stores s ON s.zone_id = z.id
     LEFT JOIN inventory i ON i.store_id = s.id
     WHERE z.is_active = true
     GROUP BY z.id`
  );
  return result.rows;
};

const getZoneSales = async (zoneId, { period = 'today' }) => {
  let dateFilter = "DATE(o.created_at) = CURRENT_DATE";
  if (period === 'week') dateFilter = "o.created_at >= NOW() - INTERVAL '7 days'";
  else if (period === 'month') dateFilter = "o.created_at >= NOW() - INTERVAL '30 days'";

  const result = await query(
    `SELECT s.name as store_name, s.code as store_code,
     COUNT(DISTINCT o.id) as order_count,
     COALESCE(SUM(o.total), 0) as total_sales
     FROM stores s
     LEFT JOIN orders o ON o.store_id = s.id AND o.status != 'cancelled' AND ${dateFilter}
     WHERE s.zone_id = $1
     GROUP BY s.id, s.name, s.code`,
    [zoneId]
  );
  return result.rows;
};

const getZoneStock = async (zoneId) => {
  const result = await query(
    `SELECT s.name as store_name, s.code,
     COUNT(DISTINCT p.id) as product_count,
     SUM(i.quantity) as total_stock,
     SUM(CASE WHEN i.quantity <= i.min_stock_level THEN 1 ELSE 0 END) as low_stock_count
     FROM stores s
     LEFT JOIN inventory i ON i.store_id = s.id
     LEFT JOIN products p ON p.id = i.product_id
     WHERE s.zone_id = $1
     GROUP BY s.id, s.name, s.code`,
    [zoneId]
  );
  return result.rows;
};

const getZoneOnlineOrders = async (zoneId) => {
  const result = await query(
    `SELECT o.id, o.order_number, o.status, o.total, o.delivery_status, o.created_at
     FROM orders o
     WHERE o.type = 'online' AND o.delivery_address->>'division' IN (
       SELECT division FROM zones WHERE id = $1
     )
     ORDER BY o.created_at DESC
     LIMIT 50`,
    [zoneId]
  );
  return result.rows;
};

const getZoneDetail = async (zoneId) => {
  const [zone, stores, proximity] = await Promise.all([
    query('SELECT * FROM zones WHERE id = $1', [zoneId]),
    query('SELECT * FROM stores WHERE zone_id = $1 AND is_active = true', [zoneId]),
    query('SELECT zp.*, z.name as neighbor_name, z.code as neighbor_code FROM zone_proximity zp JOIN zones z ON z.id = zp.zone_id_to WHERE zp.zone_id_from = $1 ORDER BY zp.distance_km', [zoneId]),
  ]);

  return { zone: zone.rows[0], stores: stores.rows, proximity: proximity.rows };
};

module.exports = { getAllZones, getZoneSales, getZoneStock, getZoneOnlineOrders, getZoneDetail };
