-- ============================================
-- Unified Commerce Platform - Seed Data
-- ============================================

-- Insert Roles
INSERT INTO roles (name, permissions) VALUES
('admin', '{"all": true}'),
('manager', '{"orders": true, "inventory": true, "reports": true, "products": true}'),
('seller', '{"pos": true, "orders": true}'),
('warehouse_staff', '{"warehouse": true, "transfers": true}'),
('customer', '{"shop": true}')
ON CONFLICT (name) DO NOTHING;

-- Insert Zones (8 Zones)
INSERT INTO zones (id, name, code, division) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'ময়মনসিংহ জোন', 'MYM', 'Mymensingh'),
('a1b2c3d4-0001-0001-0001-000000000002', 'ঢাকা জোন', 'DHK', 'Dhaka'),
('a1b2c3d4-0001-0001-0001-000000000003', 'রাজশাহী জোন', 'RAJ', 'Rajshahi'),
('a1b2c3d4-0001-0001-0001-000000000004', 'চট্টগ্রাম জোন', 'CTG', 'Chittagong'),
('a1b2c3d4-0001-0001-0001-000000000005', 'খুলনা জোন', 'KHL', 'Khulna'),
('a1b2c3d4-0001-0001-0001-000000000006', 'কুমিল্লা জোন', 'CML', 'Comilla'),
('a1b2c3d4-0001-0001-0001-000000000007', 'জামালপুর জোন', 'JML', 'Mymensingh'),
('a1b2c3d4-0001-0001-0001-000000000008', 'শেরপুর জোন', 'SHP', 'Mymensingh')
ON CONFLICT (code) DO NOTHING;

-- Zone Proximity
INSERT INTO zone_proximity (zone_id_from, zone_id_to, distance_km) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000007', 68),
('a1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000008', 55),
('a1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000002', 120),
('a1b2c3d4-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000006', 97),
('a1b2c3d4-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000004', 264),
('a1b2c3d4-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000003', 252),
('a1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000006', 150),
('a1b2c3d4-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000005', 278),
('a1b2c3d4-0001-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000002', 304),
('a1b2c3d4-0001-0001-0001-000000000007', 'a1b2c3d4-0001-0001-0001-000000000008', 42),
('a1b2c3d4-0001-0001-0001-000000000007', 'a1b2c3d4-0001-0001-0001-000000000002', 177),
('a1b2c3d4-0001-0001-0001-000000000008', 'a1b2c3d4-0001-0001-0001-000000000002', 193)
ON CONFLICT DO NOTHING;

-- Insert 8 Stores
INSERT INTO stores (id, name, code, type, zone_id, address, phone) VALUES
('b1c2d3e4-0001-0001-0001-000000000001', 'ময়মনসিংহ শোরুম', 'STR-MYM-01', 'showroom', 'a1b2c3d4-0001-0001-0001-000000000001', 'ময়মনসিংহ শহর, ময়মনসিংহ', '01700000001'),
('b1c2d3e4-0001-0001-0001-000000000002', 'ঢাকা প্রধান শোরুম', 'STR-DHK-01', 'flagship', 'a1b2c3d4-0001-0001-0001-000000000002', 'গুলশান-২, ঢাকা', '01700000002'),
('b1c2d3e4-0001-0001-0001-000000000003', 'রাজশাহী শোরুম', 'STR-RAJ-01', 'showroom', 'a1b2c3d4-0001-0001-0001-000000000003', 'রাজশাহী শহর, রাজশাহী', '01700000003'),
('b1c2d3e4-0001-0001-0001-000000000004', 'চট্টগ্রাম শোরুম', 'STR-CTG-01', 'showroom', 'a1b2c3d4-0001-0001-0001-000000000004', 'আগ্রাবাদ, চট্টগ্রাম', '01700000004'),
('b1c2d3e4-0001-0001-0001-000000000005', 'খুলনা শোরুম', 'STR-KHL-01', 'showroom', 'a1b2c3d4-0001-0001-0001-000000000005', 'খুলনা শহর, খুলনা', '01700000005'),
('b1c2d3e4-0001-0001-0001-000000000006', 'কুমিল্লা শোরুম', 'STR-CML-01', 'showroom', 'a1b2c3d4-0001-0001-0001-000000000006', 'কুমিল্লা শহর, কুমিল্লা', '01700000006'),
('b1c2d3e4-0001-0001-0001-000000000007', 'জামালপুর আউটলেট', 'STR-JML-01', 'outlet', 'a1b2c3d4-0001-0001-0001-000000000007', 'জামালপুর শহর, জামালপুর', '01700000007'),
('b1c2d3e4-0001-0001-0001-000000000008', 'শেরপুর আউটলেট', 'STR-SHP-01', 'outlet', 'a1b2c3d4-0001-0001-0001-000000000008', 'শেরপুর শহর, শেরপুর', '01700000008')
ON CONFLICT (code) DO NOTHING;

-- Insert 3 Warehouses
INSERT INTO warehouses (id, name, code, zone_id, address, phone) VALUES
('c1d2e3f4-0001-0001-0001-000000000001', 'ময়মনসিংহ ওয়্যারহাউস', 'WH-MYM-01', 'a1b2c3d4-0001-0001-0001-000000000001', 'ময়মনসিংহ শিল্প এলাকা', '01800000001'),
('c1d2e3f4-0001-0001-0001-000000000002', 'ঢাকা সেন্ট্রাল ওয়্যারহাউস', 'WH-DHK-01', 'a1b2c3d4-0001-0001-0001-000000000002', 'তেজগাঁও শিল্প এলাকা, ঢাকা', '01800000002'),
('c1d2e3f4-0001-0001-0001-000000000003', 'চট্টগ্রাম ওয়্যারহাউস', 'WH-CTG-01', 'a1b2c3d4-0001-0001-0001-000000000004', 'বন্দর এলাকা, চট্টগ্রাম', '01800000003')
ON CONFLICT (code) DO NOTHING;

-- Insert Admin User
INSERT INTO users (name, email, phone, password_hash, role_id) VALUES
('System Admin', 'admin@unified.com', '01900000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1)
ON CONFLICT (email) DO NOTHING;

-- Insert Categories
INSERT INTO categories (name, slug) VALUES
('ইলেকট্রনিক্স', 'electronics'),
('মোবাইল ও ট্যাবলেট', 'mobile-tablet'),
('কম্পিউটার', 'computer'),
('হোম অ্যাপ্লায়েন্স', 'home-appliance'),
('ফ্যাশন', 'fashion'),
('স্বাস্থ্য ও সৌন্দর্য', 'health-beauty'),
('খেলাধুলা', 'sports'),
('খাদ্য ও পানীয়', 'food-beverage')
ON CONFLICT (slug) DO NOTHING;

-- Insert Sample Products
INSERT INTO products (name, slug, sku, barcode, description, category_id, brand, price, compare_price, is_featured, is_trending, tags)
SELECT
    'Samsung Galaxy A54 5G',
    'samsung-galaxy-a54-5g',
    'MOB-SAM-A54',
    '8801643897654',
    'Samsung Galaxy A54 5G স্মার্টফোন - ৬৪MP ক্যামেরা, ৫০০০mAh ব্যাটারি',
    id,
    'Samsung',
    42000.00,
    45000.00,
    true,
    true,
    ARRAY['smartphone', '5g', 'samsung']
FROM categories WHERE slug = 'mobile-tablet'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, slug, sku, barcode, description, category_id, brand, price, compare_price, is_featured, is_trending, tags)
SELECT
    'iPhone 15 Pro',
    'iphone-15-pro',
    'MOB-APL-15P',
    '8801234567890',
    'Apple iPhone 15 Pro - A17 Bionic Chip, Titanium Frame',
    id,
    'Apple',
    155000.00,
    165000.00,
    true,
    true,
    ARRAY['iphone', 'apple', '5g', 'premium']
FROM categories WHERE slug = 'mobile-tablet'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, slug, sku, barcode, description, category_id, brand, price, compare_price, is_featured, is_trending)
SELECT
    'Dell Inspiron 15 3520',
    'dell-inspiron-15-3520',
    'LAP-DEL-3520',
    '8809876543210',
    'Dell Inspiron 15 3520 Laptop - Intel Core i5, 8GB RAM, 512GB SSD',
    id,
    'Dell',
    68000.00,
    75000.00,
    true,
    false
FROM categories WHERE slug = 'computer'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, slug, sku, barcode, description, category_id, brand, price, compare_price, is_featured)
SELECT
    'Sony 43" Bravia Smart TV',
    'sony-43-bravia-smart-tv',
    'TV-SON-43B',
    '8805555123456',
    'Sony 43 Inch Bravia 4K Smart Android TV',
    id,
    'Sony',
    52000.00,
    58000.00,
    true
FROM categories WHERE slug = 'electronics'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, slug, sku, barcode, description, category_id, brand, price, compare_price)
SELECT
    'Walton Frost-Free Refrigerator 350L',
    'walton-fridge-350l',
    'REF-WAL-350',
    '8807777654321',
    'Walton Frost-Free Refrigerator 350 Liter with Digital Display',
    id,
    'Walton',
    38000.00,
    42000.00
FROM categories WHERE slug = 'home-appliance'
ON CONFLICT (sku) DO NOTHING;

-- Add inventory for all stores
INSERT INTO inventory (store_id, product_id, quantity, min_stock_level)
SELECT s.id, p.id, (RANDOM() * 50 + 10)::INTEGER, 5
FROM stores s CROSS JOIN products p
ON CONFLICT (store_id, product_id, variant_id) DO NOTHING;

-- Add warehouse inventory
INSERT INTO warehouse_inventory (warehouse_id, product_id, quantity, min_stock_level)
SELECT w.id, p.id, (RANDOM() * 200 + 50)::INTEGER, 20
FROM warehouses w CROSS JOIN products p
ON CONFLICT (warehouse_id, product_id, variant_id) DO NOTHING;

-- Sample Customers
INSERT INTO customers (name, phone, email, loyalty_points) VALUES
('রহিম উদ্দিন', '01711111111', 'rahim@example.com', 500),
('করিম হোসেন', '01722222222', 'karim@example.com', 250),
('সুমাইয়া বেগম', '01733333333', 'sumaiya@example.com', 1200),
('মাহমুদ আলী', '01744444444', 'mahmud@example.com', 100),
('নাজমা খাতুন', '01755555555', 'najma@example.com', 750)
ON CONFLICT (phone) DO NOTHING;
