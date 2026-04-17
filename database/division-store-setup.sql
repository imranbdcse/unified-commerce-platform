-- Division Store Setup
-- 8 Zones, 8 Stores, seed inventory

-- This file creates division-level configuration
-- Zones already created in seed.sql

-- Ensure store-zone assignments are correct
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'MYM') WHERE code = 'STR-MYM-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'DHK') WHERE code = 'STR-DHK-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'RAJ') WHERE code = 'STR-RAJ-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'CTG') WHERE code = 'STR-CTG-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'KHL') WHERE code = 'STR-KHL-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'CML') WHERE code = 'STR-CML-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'JML') WHERE code = 'STR-JML-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'SHP') WHERE code = 'STR-SHP-01';

-- Seed additional inventory for each store (50 units per product)
INSERT INTO inventory (store_id, product_id, quantity, min_stock_level)
SELECT s.id, p.id, 50, 10
FROM stores s CROSS JOIN products p
ON CONFLICT (store_id, product_id, variant_id) DO UPDATE SET quantity = EXCLUDED.quantity;
