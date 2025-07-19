# Supabase環境設定手順

## 1. Supabaseプロジェクト作成

### A. アカウント作成・ログイン
1. **Supabase**にアクセス: https://supabase.com/
2. 「Start your project」をクリック
3. GitHubまたはGoogleアカウントでサインイン

### B. 新規プロジェクト作成
1. 「New Project」をクリック
2. **プロジェクト設定:**
   ```
   Organization: 個人または組織を選択
   Project name: mitoseika-system
   Database Password: 強力なパスワード（必ず保存）
   Region: Japan (Asia Northeast)
   Pricing Plan: Free tier
   ```

## 2. データベース設定

### A. SQLエディタでスキーマ作成
1. Supabaseダッシュボード → 「SQL Editor」
2. `supabase_schema.sql`の内容を実行
3. すべてのテーブルが正常に作成されることを確認

### B. Row Level Security (RLS) 設定確認
```sql
-- RLSポリシーが適用されていることを確認
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 3. 認証設定

### A. 認証プロバイダー設定
1. ダッシュボード → 「Authentication」 → 「Providers」
2. **Email認証**を有効化（デフォルト）
3. **LINE認証（オプション）**:
   ```
   Provider: OAuth
   Client ID: LINE Channel ID
   Client Secret: LINE Channel Secret
   ```

### B. ユーザー管理
1. 「Authentication」 → 「Users」
2. 初期管理者ユーザーを作成
3. **管理者メールアドレス**で登録

## 4. API設定

### A. プロジェクト情報取得
1. ダッシュボード → 「Settings」 → 「API」
2. **重要な情報をコピー:**
   ```
   Project URL: https://[your-project-id].supabase.co
   API Key (anon): eyJ... (公開キー)
   API Key (service_role): eyJ... (管理者キー、秘匿)
   ```

### B. データベース接続情報
```
Host: db.[your-project-id].supabase.co
Database: postgres
Port: 5432
User: postgres
Password: [設定したパスワード]
```

## 5. LIFF連携のための設定

### A. LIFFからのアクセス許可
1. ダッシュボード → 「Settings」 → 「API」
2. **CORS設定**に以下を追加:
   ```
   https://liff.line.me
   https://d71280.github.io
   ```

### B. RLSポリシーの調整（LIFF用）
```sql
-- LIFF認証ユーザー用のポリシー追加
CREATE POLICY "liff_user_access" ON orders 
FOR ALL USING (
  auth.jwt() ->> 'sub' IS NOT NULL OR 
  auth.role() = 'anon'
);

CREATE POLICY "liff_user_access" ON clients 
FOR SELECT USING (auth.role() = 'anon');

CREATE POLICY "liff_user_access" ON products 
FOR SELECT USING (auth.role() = 'anon');
```

## 6. 環境変数設定

### A. アプリケーション用環境変数
```env
# Supabase設定
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LINE連携
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
LIFF_ID=2007611355-MbZ09XRP

# その他
NODE_ENV=production
```

### B. GitHub Actions用シークレット
1. GitHubリポジトリ → Settings → Secrets and variables → Actions
2. **Repository secrets**に追加:
   ```
   SUPABASE_URL: https://[your-project-id].supabase.co
   SUPABASE_ANON_KEY: eyJ...
   SUPABASE_SERVICE_ROLE_KEY: eyJ...
   ```

## 7. リアルタイム機能設定

### A. Realtime有効化
1. ダッシュボード → 「Database」 → 「Replication」
2. **対象テーブル**を有効化:
   ```
   ✓ orders
   ✓ products
   ✓ inventory_transactions
   ✓ line_messages
   ```

### B. パブリケーション確認
```sql
-- Realtimeパブリケーションの確認
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

## 8. セキュリティ設定

### A. データベースセキュリティ
```sql
-- 機密データの暗号化確認
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name IN ('clients', 'line_messages')
ORDER BY table_name, ordinal_position;
```

### B. API制限設定
1. ダッシュボード → 「Settings」 → 「API」
2. **Rate limiting**を設定:
   ```
   Requests per hour: 1000
   Size limit: 50MB
   ```

## 9. バックアップ設定

### A. 自動バックアップ有効化
1. ダッシュボード → 「Settings」 → 「Database」
2. **Backup settings**:
   ```
   ✓ Point-in-time recovery
   Retention: 7 days (Free tier)
   ```

### B. 手動エクスポート
```bash
# pg_dumpを使用したバックアップ
pg_dump "postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres" \
  --schema=public \
  --file=mitoseika_backup.sql
```

## 10. 初期データ投入

### A. マスタデータ投入
```sql
-- サンプル仕入先
INSERT INTO suppliers (name, contact_person, phone) VALUES
  ('水戸中央卸売市場', '田中商事', '029-123-4567'),
  ('茨城県農協', '農産部', '029-234-5678');

-- サンプル商品
INSERT INTO products (name, category, unit, purchase_price, sale_price, current_stock) VALUES
  ('キャベツ', '野菜', '個', 120, 150, 50),
  ('きゅうり', '野菜', '個', 1600, 2000, 30),
  ('白菜', '野菜', '個', 250, 300, 40);

-- サンプル顧客
INSERT INTO clients (company_name, contact_person, phone) VALUES
  ('A商店', '山田 太郎', '03-1234-5678'),
  ('B食堂', '佐藤 花子', '03-9876-5432');
```

## 11. 動作確認

### A. 基本機能テスト
```sql
-- データ取得テスト
SELECT p.name, p.sale_price, s.name as supplier_name
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.is_active = true;

-- 注文データテスト
SELECT o.order_number, c.company_name, o.total_amount
FROM orders o
JOIN clients c ON o.client_id = c.id
ORDER BY o.created_at DESC;
```

### B. API接続テスト
```javascript
// Supabase接続テスト
const { data, error } = await supabase
  .from('products')
  .select('*')
  .limit(5);

console.log('Products:', data);
console.log('Error:', error);
```

## 12. 本番運用準備

### A. パフォーマンス最適化
1. **インデックス確認**:
   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE schemaname = 'public';
   ```

2. **クエリ性能監視**:
   - ダッシュボード → 「Reports」でクエリ性能を確認

### B. 監視設定
1. **アラート設定**:
   - Database usage > 80%
   - API requests > 500/hour
   - Error rate > 5%

2. **ログ監視**:
   - ダッシュボード → 「Logs」で API/Database ログを確認

## トラブルシューティング

### よくある問題

1. **接続エラー**
   ```
   Error: Invalid API key
   → API Keyが正しいか確認
   → プロジェクトURLが正しいか確認
   ```

2. **RLSエラー**
   ```
   Error: Row level security policy violation
   → 適切なポリシーが設定されているか確認
   → ユーザー認証状態を確認
   ```

3. **CORS エラー**
   ```
   Error: CORS policy blocks request
   → CORS設定にドメインを追加
   → HTTPSアクセスを確認
   ```

## 現在の設定状況

- **Project URL**: `https://exmpbeheepptuippyoby.supabase.co`
- **Anon Key**: 設定済み（lib/supabase.ts）
- **Schema**: 完全なテーブル構造作成済み
- **RLS**: 全テーブルで有効化済み
- **Realtime**: 主要テーブルで有効化済み