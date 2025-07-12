# 技術仕様

## 🏗️ システムアーキテクチャ

### フロントエンド

```
React 19.1.0
├── TypeScript 5.7.2
├── Vite 6.2.0 (ビルドツール)
├── Tailwind CSS (スタイリング)
├── Supabase Client (データベース接続)
└── React Hooks (状態管理)
```

### バックエンド・インフラ

```
Supabase
├── PostgreSQL (データベース)
├── Realtime (リアルタイム同期)
├── Auth (認証・認可)
├── Edge Functions (サーバーレス関数)
└── Storage (ファイルストレージ)
```

### 外部連携

```
LINE Messaging API
├── Webhook受信
├── メッセージ送受信
└── ユーザー管理

市場価格API
├── 農水省API
├── 東京都中央卸売市場API
└── 地方卸売市場API（茨城県等）
```

## 🔧 技術スタック詳細

### 1. フロントエンド技術

#### React 実装方針

```typescript
// フック中心の設計
- useState: ローカル状態管理
- useEffect: 副作用処理・API呼び出し
- useContext: グローバル状態（必要に応じて）
- カスタムフック: 共通ロジックの抽象化
```

#### Supabase React 統合

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase";

const supabase = createClient<Database>(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

// リアルタイム購読例
useEffect(() => {
  const subscription = supabase
    .channel("orders")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      (payload) => {
        setOrders((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### 2. データベース技術

#### Supabase 設定

```sql
-- プロジェクト設定
Project URL: https://your-project.supabase.co
API Keys: anon_key, service_role_key
Database: PostgreSQL 15

-- 接続設定
Max Connections: 100
Connection Pooling: Transaction
SSL Mode: require
```

#### 型安全性確保

```typescript
// Supabase CLI生成型定義
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts

// 型安全なクエリ
const { data, error } = await supabase
  .from('products')
  .select('id, name, current_stock, low_stock_threshold')
  .eq('is_active', true)
  .returns<Product[]>()
```

### 3. LINE Bot 技術

#### Webhook 受信システム

```typescript
// Supabase Edge Function例
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "POST") {
    const body = await req.json();

    // LINE署名検証
    const signature = req.headers.get("x-line-signature");
    if (!verifyLineSignature(signature, body)) {
      return new Response("Unauthorized", { status: 401 });
    }

    // メッセージ処理
    await processLineMessage(body.events[0]);

    return new Response("OK", { status: 200 });
  }
});
```

#### 自然言語処理

```typescript
// メッセージ解析ライブラリ候補
interface MessageParser {
  parseOrderMessage(text: string): ParsedOrder | null;
}

class OrderMessageParser implements MessageParser {
  parseOrderMessage(text: string): ParsedOrder | null {
    // 正規表現 + ルールベース解析
    const patterns = [
      /(\w+)\s*(\d+)(個|箱|ケース|kg)/g,
      /(明日|今日|至急)/,
      /(配送|納品)/,
    ];

    // OpenAI API使用も検討
    // const response = await openai.completions.create({...})

    return {
      items: extractItems(text),
      deliveryDate: extractDeliveryDate(text),
      urgency: extractUrgency(text),
    };
  }
}
```

### 4. 価格管理技術

#### 市場価格 API 連携

```typescript
// 農水省API例
interface MarketPriceAPI {
  fetchDailyPrices(date: string): Promise<PriceData[]>;
}

class AgricultureMinistryAPI implements MarketPriceAPI {
  async fetchDailyPrices(date: string): Promise<PriceData[]> {
    const response = await fetch(
      `https://www.maff.go.jp/j/tokei/kouhyou/api/market_price.json?date=${date}`
    );
    return await response.json();
  }
}

// 価格更新スケジュール（Supabase Cron Functions）
export const scheduledPriceUpdate = async () => {
  const prices = await marketAPI.fetchDailyPrices(today());

  for (const price of prices) {
    await supabase.from("price_history").insert({
      product_id: price.productId,
      market_price: price.price,
      price_date: price.date,
      source: "agriculture_ministry",
    });
  }
};
```

## 🔐 セキュリティ仕様

### 1. 認証・認可

```typescript
// Supabase Auth設定
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@mitoseika.com',
  password: 'secure_password'
})

// RLS（Row Level Security）
CREATE POLICY "ユーザー企業データのみアクセス" ON orders
  FOR ALL USING (
    auth.jwt() ->> 'company_id' = company_id::text
  );
```

### 2. データ保護

```typescript
// 環境変数管理
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
LINE_CHANNEL_SECRET=your-line-secret
LINE_ACCESS_TOKEN=your-line-token

// HTTPS強制・CORS設定
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://mitoseika-system.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}
```

## 📊 パフォーマンス仕様

### 1. フロントエンド最適化

```typescript
// React.memo活用
const ProductList = React.memo(({ products }) => {
  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
});

// 遅延読み込み
const Dashboard = lazy(() => import("./components/DashboardPage"));
const Analysis = lazy(() => import("./components/DetailedAnalysisPage"));

// 仮想化（大量データ対応）
import { FixedSizeList as List } from "react-window";
```

### 2. データベース最適化

```sql
-- インデックス戦略
CREATE INDEX CONCURRENTLY idx_orders_client_date
  ON orders(client_id, order_date DESC);

-- クエリ最適化
EXPLAIN ANALYZE
SELECT p.name, i.current_stock
FROM products p
JOIN inventory i ON p.id = i.product_id
WHERE p.category = '葉物野菜'
  AND i.current_stock < p.low_stock_threshold;
```

## 🚀 デプロイメント仕様

### 1. 本番環境構成

```yaml
# Vercel/Netlify デプロイ設定
build:
  command: "npm run build"
  publish: "dist"

environment:
  NODE_ENV: "production"
  REACT_APP_SUPABASE_URL: $SUPABASE_URL
  REACT_APP_SUPABASE_ANON_KEY: $SUPABASE_ANON_KEY
```

### 2. モニタリング

```typescript
// エラー追跡
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// パフォーマンス監視
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log("Performance:", entry.name, entry.duration);
  }
});
observer.observe({ entryTypes: ["navigation", "resource"] });
```

## 📱 互換性仕様

### ブラウザサポート

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### モバイル対応

- iOS Safari 14+
- Android Chrome 90+
- レスポンシブデザイン（320px〜2560px）

---

_最終更新: 2024 年 12 月_
