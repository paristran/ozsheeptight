-- Product variation support for OzSheepTight

-- Variant options (e.g., "Color", "Size")
CREATE TABLE IF NOT EXISTS variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variant option values (e.g., "Red", "Blue", "S", "M", "L")
CREATE TABLE IF NOT EXISTS variant_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES variant_options(id) ON DELETE CASCADE,
  value VARCHAR(100) NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants (combinations with own price/stock/image)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title VARCHAR(255),
  sku VARCHAR(255),
  price DECIMAL(10,2) DEFAULT 0,
  compare_at_price DECIMAL(10,2),
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: variant <-> option_values
CREATE TABLE IF NOT EXISTS variant_value_combinations (
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  value_id UUID NOT NULL REFERENCES variant_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, value_id)
);

-- RLS
ALTER TABLE variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_value_combinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read variant_options" ON variant_options FOR SELECT USING (true);
CREATE POLICY "Public read variant_values" ON variant_values FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read variant_value_combinations" ON variant_value_combinations FOR SELECT USING (true);
CREATE POLICY "Service role all variant_options" ON variant_options FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all variant_values" ON variant_values FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all product_variants" ON product_variants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all variant_value_combinations" ON variant_value_combinations FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_variant_options_product ON variant_options(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_values_option ON variant_values(option_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_combinations_variant ON variant_value_combinations(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_combinations_value ON variant_value_combinations(value_id);
