-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10, 2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  images TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories Policies
-- Public can read active categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- Products Policies
-- Public can read active products
CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT
  USING (active = true);

-- Authenticated users can see all products
CREATE POLICY "All products viewable by authenticated users"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- Orders Policies
-- Only authenticated users can access orders
CREATE POLICY "Orders viewable by authenticated users"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true); -- Allow anyone to create orders (for checkout)

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  USING (auth.role() = 'authenticated');

-- Order Items Policies
CREATE POLICY "Order items viewable by authenticated users"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update order items"
  ON order_items FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete order items"
  ON order_items FOR DELETE
  USING (auth.role() = 'authenticated');

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Blankets', 'blankets', 'Soft and cozy blankets for your little ones', 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800'),
('Clothing', 'clothing', 'Adorable baby clothing made from premium materials', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'),
('Toys', 'toys', 'Safe and educational toys for babies and toddlers', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800'),
('Nursery', 'nursery', 'Everything you need to create the perfect nursery', 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800'),
('Feeding', 'feeding', 'Premium feeding accessories and supplies', 'https://images.unsplash.com/photo-1584839404042-8bc02ce22c51?w=800')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (title, slug, description, price, compare_at_price, category_id, image_url, stock_quantity, featured, active) VALUES
(
  'Premium Merino Wool Blanket',
  'premium-merino-wool-blanket',
  'Luxuriously soft merino wool blanket, perfect for keeping your baby warm and comfortable. Made from 100% Australian merino wool.',
  129.99,
  159.99,
  (SELECT id FROM categories WHERE slug = 'blankets'),
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800',
  50,
  true,
  true
),
(
  'Organic Cotton Baby Onesie Set',
  'organic-cotton-baby-onesie-set',
  'Set of 3 organic cotton onesies in neutral colors. Super soft and gentle on baby''s skin.',
  49.99,
  NULL,
  (SELECT id FROM categories WHERE slug = 'clothing'),
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
  100,
  true,
  true
),
(
  'Wooden Activity Cube',
  'wooden-activity-cube',
  'Interactive wooden activity cube with multiple learning activities. Helps develop motor skills and cognitive abilities.',
  89.99,
  109.99,
  (SELECT id FROM categories WHERE slug = 'toys'),
  'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800',
  30,
  true,
  true
),
(
  'Cloud Mobile Nursery Decor',
  'cloud-mobile-nursery-decor',
  'Beautiful handcrafted cloud mobile made from premium felt. Perfect addition to any nursery.',
  69.99,
  NULL,
  (SELECT id FROM categories WHERE slug = 'nursery'),
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800',
  25,
  false,
  true
),
(
  'Silicone Baby Bib Set',
  'silicone-baby-bib-set',
  'Set of 4 premium silicone baby bibs with catch-all pocket. Easy to clean and dishwasher safe.',
  34.99,
  44.99,
  (SELECT id FROM categories WHERE slug = 'feeding'),
  'https://images.unsplash.com/photo-1584839404042-8bc02ce22c51?w=800',
  75,
  false,
  true
),
(
  'Cashmere Baby Booties',
  'cashmere-baby-booties',
  'Ultra-soft cashmere baby booties in natural cream color. Keeps tiny toes warm and cozy.',
  59.99,
  NULL,
  (SELECT id FROM categories WHERE slug = 'clothing'),
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800',
  40,
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;
