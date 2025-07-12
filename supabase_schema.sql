-- 水戸青果 究極の粗利管理システム データベーススキーマ
-- Supabase用完全版SQLファイル

-- 1. 仕入先テーブル（他のテーブルから参照されるため最初に作成）
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  payment_terms INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 商品マスタ
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- 個, 箱, ケース, kg, セット
  purchase_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  supplier_id UUID REFERENCES suppliers(id),
  seasonality TEXT[], -- ['春', '夏', '秋', '冬', '通年']
  current_stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 価格履歴
CREATE TABLE price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  market_price DECIMAL(10,2),
  purchase_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  price_date DATE NOT NULL,
  source VARCHAR(100), -- API取得元
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 顧客マスタ
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  line_user_id VARCHAR(100) UNIQUE, -- LINE連携用
  rule_summary TEXT,
  payment_terms INTEGER DEFAULT 30, -- 支払サイト（日）
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 注文
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id),
  order_date DATE NOT NULL,
  delivery_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, delivered, cancelled, invoiced
  sub_total DECIMAL(12,2),
  tax_rate DECIMAL(4,3) DEFAULT 0.10,
  tax_amount DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  notes TEXT,
  delivery_notes TEXT,
  line_message_id VARCHAR(100), -- LINE連携用
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. 注文明細
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_number INTEGER,
  product_id UUID REFERENCES products(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. 在庫移動履歴
CREATE TABLE inventory_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  transaction_type VARCHAR(20) NOT NULL, -- purchase, sale, adjustment, taking
  quantity_change INTEGER NOT NULL, -- 正負で入出庫表現
  remaining_stock INTEGER NOT NULL,
  reference_id UUID, -- order_id等の参照
  notes TEXT,
  transaction_date TIMESTAMP DEFAULT NOW(),
  created_by UUID -- 操作者ID
);

-- 8. 仕入計算
CREATE TABLE purchase_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  current_stock INTEGER,
  order_quantity DECIMAL(10,2),
  required_purchase DECIMAL(10,2),
  market_price DECIMAL(10,2),
  estimated_cost DECIMAL(12,2),
  profit_margin DECIMAL(5,2),
  calculation_date TIMESTAMP DEFAULT NOW()
);

-- 9. LINE メッセージログ
CREATE TABLE line_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id VARCHAR(100) NOT NULL,
  client_id UUID REFERENCES clients(id),
  message_id VARCHAR(100) UNIQUE,
  message_text TEXT NOT NULL,
  parsed_data JSONB, -- 解析結果
  order_id UUID REFERENCES orders(id), -- 生成された注文
  processing_status VARCHAR(20) DEFAULT 'received', -- received, processing, completed, error
  error_message TEXT,
  received_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- 10. システム設定
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID
);

-- Row Level Security (RLS) の有効化
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（認証ユーザーのみアクセス許可）
CREATE POLICY "authenticated_access" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON price_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON inventory_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON purchase_calculations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON line_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_access" ON system_settings FOR ALL USING (auth.role() = 'authenticated');

-- パフォーマンス最適化インデックス
-- 商品検索用
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_active ON products(is_active);

-- 注文検索用
CREATE INDEX idx_orders_client_date ON orders(client_id, order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_line_message ON orders(line_message_id);

-- 注文明細検索用
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- 在庫検索用
CREATE INDEX idx_inventory_product_date ON inventory_transactions(product_id, transaction_date);
CREATE INDEX idx_inventory_type ON inventory_transactions(transaction_type);

-- LINE連携用
CREATE INDEX idx_line_messages_user_date ON line_messages(line_user_id, received_at);
CREATE INDEX idx_line_messages_status ON line_messages(processing_status);
CREATE INDEX idx_line_messages_client ON line_messages(client_id);

-- 価格履歴検索用
CREATE INDEX idx_price_history_product_date ON price_history(product_id, price_date);

-- Supabase Realtime 有効化
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE line_messages;

-- 初期データの挿入（システム設定）
INSERT INTO system_settings (key, value, description) VALUES
  ('tax_rate', '0.10', '消費税率'),
  ('order_number_prefix', 'ORD', '注文番号プレフィックス'),
  ('default_payment_terms', '30', 'デフォルト支払サイト（日）'),
  ('line_webhook_secret', '', 'LINE Webhook シークレット'),
  ('api_market_price_url', '', '市場価格API URL');