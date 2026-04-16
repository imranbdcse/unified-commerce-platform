-- Seller Code Migration
-- Add seller_code and seller_pin to users table if not exists

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='seller_code') THEN
        ALTER TABLE users ADD COLUMN seller_code VARCHAR(20) UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='seller_pin') THEN
        ALTER TABLE users ADD COLUMN seller_pin VARCHAR(6);
    END IF;
END $$;

-- Insert sample sellers
INSERT INTO users (name, phone, password_hash, role_id, seller_code, seller_pin)
VALUES
('আরিফ হোসেন', '01600000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, 'SEL-001', '123456'),
('রানা মিয়া', '01600000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, 'SEL-002', '123456'),
('সাদিয়া ইসলাম', '01600000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, 'SEL-003', '123456')
ON CONFLICT (phone) DO NOTHING;
