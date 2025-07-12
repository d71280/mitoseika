# データベース設計

## 🗄️ Supabase Database Schema

### 1. 商品管理テーブル

#### products (商品マスタ)

```sql
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
```

#### price_history (価格履歴)

```sql
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
```

### 2. 顧客管理テーブル

#### clients (顧客マスタ)

```sql
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
```

### 3. 注文管理テーブル

#### orders (注文)

```sql
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
```

#### order_items (注文明細)

```sql
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
```

### 4. 在庫管理テーブル

#### inventory_transactions (在庫移動履歴)

```sql
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
```

#### purchase_calculations (仕入計算)

```sql
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
```

### 5. LINE 連携テーブル

#### line_messages (LINE メッセージログ)

```sql
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
```

### 6. 仕入先・設定テーブル

#### suppliers (仕入先)

```sql
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
```

#### system_settings (システム設定)

```sql
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID
);
```

## 🔐 Row Level Security (RLS) ポリシー

### 基本ポリシー設定

```sql
-- 全テーブルでRLS有効化
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- 他テーブルも同様

-- 認証ユーザーのみアクセス許可
CREATE POLICY "認証ユーザーのみ" ON products
  FOR ALL USING (auth.role() = 'authenticated');
```

## 📊 インデックス設計

### パフォーマンス最適化インデックス

```sql
-- 商品検索用
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);

-- 注文検索用
CREATE INDEX idx_orders_client_date ON orders(client_id, order_date);
CREATE INDEX idx_orders_status ON orders(status);

-- 在庫検索用
CREATE INDEX idx_inventory_product_date ON inventory_transactions(product_id, transaction_date);

-- LINE連携用
CREATE INDEX idx_line_messages_user_date ON line_messages(line_user_id, received_at);
```

## 🔄 リアルタイム機能設定

### Supabase Realtime 有効化

```sql
-- リアルタイム更新対象テーブル
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE line_messages;
```

---

_最終更新: 2024 年 12 月_
