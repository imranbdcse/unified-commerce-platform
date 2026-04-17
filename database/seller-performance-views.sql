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
