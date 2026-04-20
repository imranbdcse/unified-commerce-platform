-- ============================================
-- Unified Commerce Platform - Complete Database Script
-- PostgreSQL 14+
-- This file combines all database schema, migrations, seeds, and views
-- ============================================

-- ============================================
-- SCHEMA DEFINITION
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ROLES & USERS
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    role_id INTEGER REFERENCES roles(id),
    store_id UUID,
    seller_code VARCHAR(20) UNIQUE,
    seller_pin VARCHAR(6),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CATEGORIES & PRODUCTS
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    description TEXT,
    short_description VARCHAR(500),
    category_id UUID REFERENCES categories(id),
    brand VARCHAR(255),
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    compare_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    weight DECIMAL(8,2),
    unit VARCHAR(50) DEFAULT 'piece',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    tags TEXT[],
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_tags (
    id SERIAL PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    UNIQUE(product_id, tag)
);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10),
    loyalty_points INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    label VARCHAR(50) DEFAULT 'Home',
    recipient_name VARCHAR(255),
    phone VARCHAR(20),
    address_line1 VARCHAR(500) NOT NULL,
    address_line2 VARCHAR(500),
    city VARCHAR(100),
    district VARCHAR(100),
    division VARCHAR(100),
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ZONES & STORES
-- ============================================

CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    division VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zone_proximity (
    id SERIAL PRIMARY KEY,
    zone_id_from UUID REFERENCES zones(id),
    zone_id_to UUID REFERENCES zones(id),
    distance_km DECIMAL(8,2) NOT NULL,
    UNIQUE(zone_id_from, zone_id_to)
);

CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'showroom',
    zone_id UUID REFERENCES zones(id),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key for users.store_id after stores table is created
ALTER TABLE users ADD CONSTRAINT fk_users_store FOREIGN KEY (store_id) REFERENCES stores(id);

-- ============================================
-- WAREHOUSES
-- ============================================

CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    zone_id UUID REFERENCES zones(id),
    address TEXT,
    phone VARCHAR(20),
    manager_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(warehouse_id, product_id, variant_id)
);

-- ============================================
-- INVENTORY (Store-level)
-- ============================================

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(store_id, product_id, variant_id)
);

-- ============================================
-- STOCK TRANSFERS
-- ============================================

CREATE TABLE IF NOT EXISTS stock_transfer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    source_type VARCHAR(20) NOT NULL, -- 'store' or 'warehouse'
    source_id UUID NOT NULL,
    destination_type VARCHAR(20) NOT NULL,
    destination_id UUID NOT NULL,
    status VARCHAR(30) DEFAULT 'pending', -- pending/approved/in_transit/received/cancelled
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id UUID REFERENCES stock_transfer_requests(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    requested_quantity INTEGER NOT NULL,
    approved_quantity INTEGER,
    received_quantity INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) DEFAULT 'pos', -- pos/online/offline
    status VARCHAR(30) DEFAULT 'pending',
    customer_id UUID REFERENCES customers(id),
    store_id UUID REFERENCES stores(id),
    seller_id UUID REFERENCES users(id),
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    delivery_charge DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    delivery_address JSONB,
    delivery_status VARCHAR(30),
    is_synced BOOLEAN DEFAULT true,
    offline_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name VARCHAR(500),
    sku VARCHAR(100),
    price DECIMAL(12,2) NOT NULL,
    quantity INTEGER NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- cash/card/bkash/nagad
    amount DECIMAL(12,2) NOT NULL,
    reference VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ORDER FULFILLMENT
-- ============================================

CREATE TABLE IF NOT EXISTS order_fulfillments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    fulfillment_source_type VARCHAR(20), -- store/warehouse
    fulfillment_source_id UUID,
    status VARCHAR(30) DEFAULT 'pending',
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SELLER COMMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS seller_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    order_item_id UUID REFERENCES order_items(id),
    sale_amount DECIMAL(12,2) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 2.5,
    commission_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending/approved/paid
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- OTP CODES
-- ============================================

CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) DEFAULT 'login', -- login/register/reset
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_commissions_seller ON seller_commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ============================================
-- MIGRATIONS
-- ============================================

-- Warehouse Division Migration
-- Link warehouses to divisions/zones
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS division_name VARCHAR(100);
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS coverage_zones UUID[];

-- Fulfillment Transfer Migration
ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS transfer_request_id UUID REFERENCES stock_transfer_requests(id);
ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;
ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS actual_delivery_date DATE;
ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS delivery_agent_name VARCHAR(255);
ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS delivery_agent_phone VARCHAR(20);

-- ============================================
-- VIEWS
-- ============================================

-- Seller Performance Views
CREATE OR REPLACE VIEW seller_daily_performance AS
SELECT
    u.id AS seller_id,
    u.name AS seller_name,
    u.seller_code,
    DATE(o.created_at) AS sale_date,
    COUNT(DISTINCT o.id) AS order_count,
    SUM(o.total) AS total_sales,
    SUM(sc.commission_amount) AS total_commission
FROM users u
LEFT JOIN orders o ON o.seller_id = u.id AND o.status != 'cancelled'
LEFT JOIN seller_commissions sc ON sc.seller_id = u.id AND DATE(sc.created_at) = DATE(o.created_at)
WHERE u.role_id = (SELECT id FROM roles WHERE name = 'seller')
GROUP BY u.id, u.name, u.seller_code, DATE(o.created_at);

CREATE OR REPLACE VIEW seller_leaderboard AS
SELECT
    u.id AS seller_id,
    u.name AS seller_name,
    u.seller_code,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_sales,
    COALESCE(SUM(sc.commission_amount), 0) AS total_commission,
    RANK() OVER (ORDER BY COALESCE(SUM(o.total), 0) DESC) AS rank
FROM users u
LEFT JOIN orders o ON o.seller_id = u.id AND o.status != 'cancelled'
LEFT JOIN seller_commissions sc ON sc.seller_id = u.id
WHERE u.role_id = (SELECT id FROM roles WHERE name = 'seller')
GROUP BY u.id, u.name, u.seller_code;

-- ============================================
-- SEED DATA
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

-- Update warehouse division names
UPDATE warehouses SET division_name = 'Mymensingh' WHERE code = 'WH-MYM-01';
UPDATE warehouses SET division_name = 'Dhaka' WHERE code = 'WH-DHK-01';
UPDATE warehouses SET division_name = 'Chittagong' WHERE code = 'WH-CTG-01';

-- Insert Admin User
INSERT INTO users (name, email, phone, password_hash, role_id) VALUES
('System Admin', 'admin@unified.com', '01900000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1)
ON CONFLICT (email) DO NOTHING;

-- Insert sample sellers
INSERT INTO users (name, phone, password_hash, role_id, seller_code, seller_pin) VALUES
('আরিফ হোসেন', '01600000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, 'SEL-001', '123456'),
('রানা মিয়া', '01600000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, 'SEL-002', '123456'),
('সাদিয়া ইসলাম', '01600000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, 'SEL-003', '123456')
ON CONFLICT (phone) DO NOTHING;

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
SELECT s.id, p.id, 50, 10
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

-- Ensure store-zone assignments are correct
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'MYM') WHERE code = 'STR-MYM-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'DHK') WHERE code = 'STR-DHK-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'RAJ') WHERE code = 'STR-RAJ-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'CTG') WHERE code = 'STR-CTG-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'KHL') WHERE code = 'STR-KHL-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'CML') WHERE code = 'STR-CML-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'JML') WHERE code = 'STR-JML-01';
UPDATE stores SET zone_id = (SELECT id FROM zones WHERE code = 'SHP') WHERE code = 'STR-SHP-01';

-- ============================================
-- END OF UNIFIED DATABASE SCRIPT
-- ============================================
