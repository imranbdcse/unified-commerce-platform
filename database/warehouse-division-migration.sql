-- Warehouse Division Migration
-- Link warehouses to divisions/zones

ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS division_name VARCHAR(100);
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS coverage_zones UUID[];

UPDATE warehouses SET division_name = 'Mymensingh' WHERE code = 'WH-MYM-01';
UPDATE warehouses SET division_name = 'Dhaka' WHERE code = 'WH-DHK-01';
UPDATE warehouses SET division_name = 'Chittagong' WHERE code = 'WH-CTG-01';
