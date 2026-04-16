const { query } = require('../../config/database');
const { ApiError } = require('../../utils/ApiError');

// সকল পণ্য তালিকা
const getProducts = async ({ page = 1, per_page = 50, category, search, brand, min_price, max_price, sort = 'created_at', order = 'DESC' }) => {
  const limit = Math.min(parseInt(per_page), 200);
  const offset = (parseInt(page) - 1) * limit;

  let conditions = ['p.is_active = true'];
  let params = [];
  let paramIndex = 1;

  if (category) {
    conditions.push(`c.slug = $${paramIndex++}`);
    params.push(category);
  }

  if (search) {
    conditions.push(`(p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.barcode = $${paramIndex + 1})`);
    params.push(`%${search}%`, search);
    paramIndex += 2;
  }

  if (brand) {
    conditions.push(`p.brand ILIKE $${paramIndex++}`);
    params.push(`%${brand}%`);
  }

  if (min_price) {
    conditions.push(`p.price >= $${paramIndex++}`);
    params.push(parseFloat(min_price));
  }

  if (max_price) {
    conditions.push(`p.price <= $${paramIndex++}`);
    params.push(parseFloat(max_price));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSorts = ['price', 'created_at', 'name', 'purchase_count', 'view_count'];
  const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

  const dataQuery = `
    SELECT p.*, c.name as category_name, c.slug as category_slug,
    pi.url as primary_image
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    ${whereClause}
    ORDER BY p.${sortField} ${sortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${whereClause}
  `;

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, [...params, limit, offset]),
    query(countQuery, params),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    products: dataResult.rows,
    pagination: {
      total,
      page: parseInt(page),
      per_page: limit,
      total_pages: Math.ceil(total / limit),
    },
  };
};

// একটি পণ্যের বিবরণ
const getProductById = async (id) => {
  const result = await query(
    `SELECT p.*, c.name as category_name,
     json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL) as images
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images pi ON pi.product_id = p.id
     WHERE p.id = $1
     GROUP BY p.id, c.name`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Product not found');
  }

  // view count বাড়ান
  await query('UPDATE products SET view_count = view_count + 1 WHERE id = $1', [id]);

  return result.rows[0];
};

// পণ্য তৈরি করুন
const createProduct = async (data) => {
  const { name, sku, barcode, description, categoryId, brand, price, comparePrice, costPrice } = data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const result = await query(
    `INSERT INTO products (name, slug, sku, barcode, description, category_id, brand, price, compare_price, cost_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [name, slug, sku, barcode || null, description || null, categoryId || null, brand || null, price, comparePrice || null, costPrice || null]
  );

  return result.rows[0];
};

// পণ্য আপডেট করুন
const updateProduct = async (id, data) => {
  const product = await query('SELECT id FROM products WHERE id = $1', [id]);
  if (product.rows.length === 0) throw new ApiError(404, 'Product not found');

  const fields = [];
  const values = [];
  let idx = 1;

  const allowedFields = ['name', 'description', 'price', 'compare_price', 'cost_price', 'brand', 'is_active', 'is_featured', 'is_trending'];
  
  for (const field of allowedFields) {
    const camelKey = field.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    if (data[camelKey] !== undefined || data[field] !== undefined) {
      const val = data[camelKey] !== undefined ? data[camelKey] : data[field];
      fields.push(`${field} = $${idx++}`);
      values.push(val);
    }
  }

  if (fields.length === 0) throw new ApiError(400, 'No fields to update');

  values.push(id);
  const result = await query(
    `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );

  return result.rows[0];
};

// পণ্য মুছুন
const deleteProduct = async (id) => {
  await query('UPDATE products SET is_active = false WHERE id = $1', [id]);
  return { message: 'Product deactivated' };
};

// মিল পণ্য (score-based algorithm)
const getSimilarProducts = async (productId, limit = 10) => {
  const product = await query('SELECT * FROM products WHERE id = $1', [productId]);
  if (product.rows.length === 0) return [];

  const p = product.rows[0];
  
  const result = await query(
    `SELECT p.*, 
     (CASE WHEN p.category_id = $2 THEN 30 ELSE 0 END +
      CASE WHEN p.brand = $3 THEN 20 ELSE 0 END +
      CASE WHEN ABS(p.price - $4) / NULLIF($4, 0) < 0.2 THEN 25 ELSE 
           CASE WHEN ABS(p.price - $4) / NULLIF($4, 0) < 0.5 THEN 15 ELSE 0 END END
     ) AS similarity_score,
     pi.url as primary_image
     FROM products p
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE p.id != $1 AND p.is_active = true
     ORDER BY similarity_score DESC, p.purchase_count DESC
     LIMIT $5`,
    [productId, p.category_id, p.brand, p.price, limit]
  );

  return result.rows;
};

// Also bought পণ্য
const getAlsoBought = async (productId, limit = 8) => {
  const result = await query(
    `SELECT p.*, COUNT(*) as co_purchase_count,
     pi.url as primary_image
     FROM order_items oi1
     JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi2.product_id != $1
     JOIN products p ON p.id = oi2.product_id AND p.is_active = true
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE oi1.product_id = $1
     GROUP BY p.id, pi.url
     ORDER BY co_purchase_count DESC
     LIMIT $2`,
    [productId, limit]
  );

  return result.rows;
};

// ব্যক্তিগত রেকমেন্ডেশন (score-based)
const getPersonalizedRecommendations = async (customerId, limit = 10) => {
  if (!customerId) {
    return getTrendingProducts(limit);
  }

  const result = await query(
    `SELECT DISTINCT p.*, 
     (p.purchase_count * 0.4 + p.view_count * 0.1 + p.rating_avg * 10 * 0.3 +
      CASE WHEN p.category_id IN (
        SELECT DISTINCT p2.category_id FROM orders o 
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p2 ON p2.id = oi.product_id
        WHERE o.customer_id = $1
      ) THEN 20 ELSE 0 END
     ) as score,
     pi.url as primary_image
     FROM products p
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE p.is_active = true
     AND p.id NOT IN (
       SELECT DISTINCT oi.product_id FROM orders o 
       JOIN order_items oi ON oi.order_id = o.id 
       WHERE o.customer_id = $1
     )
     ORDER BY score DESC
     LIMIT $2`,
    [customerId, limit]
  );

  return result.rows;
};

// ট্রেন্ডিং পণ্য
const getTrendingProducts = async (limit = 10) => {
  const result = await query(
    `SELECT p.*, pi.url as primary_image
     FROM products p
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE p.is_active = true AND p.is_trending = true
     ORDER BY p.purchase_count DESC, p.view_count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

// Featured পণ্য
const getFeaturedProducts = async (limit = 50) => {
  const result = await query(
    `SELECT p.*, c.name as category_name, pi.url as primary_image
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
     WHERE p.is_active = true AND p.is_featured = true
     ORDER BY p.purchase_count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

// সকল ক্যাটাগরি
const getCategories = async () => {
  const result = await query(
    'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order, name'
  );
  return result.rows;
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSimilarProducts,
  getAlsoBought,
  getPersonalizedRecommendations,
  getTrendingProducts,
  getFeaturedProducts,
  getCategories,
};
