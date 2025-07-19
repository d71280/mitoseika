# Vercelログイン問題の解決手順

## 問題の原因

Vercelログイン画面が表示される主な原因：
1. **LIFFのエンドポイントURL**がVercelを指している
2. **Vercelプロジェクトが非公開**設定になっている

## 解決手順

### 1. LINE Developers Console設定確認

1. **LINE Developers Console**にアクセス
   - https://developers.line.biz/console/

2. **対象チャンネルを選択**
   - 「水戸青果注文システム」チャンネル

3. **LIFFタブで設定確認**
   - LIFF ID: `2007611355-MbZ09XRP`
   - **エンドポイントURL**: `https://d71280.github.io/mitoseika/liff.html`

### 2. エンドポイントURL更新（重要）

**現在の設定が間違っている場合:**

1. **LIFFアプリを選択**
2. **「編集」ボタン**をクリック
3. **エンドポイントURL**を以下に変更:
   ```
   https://d71280.github.io/mitoseika/liff.html
   ```
4. **「更新」ボタン**をクリック

### 3. GitHub Pages確認

1. **GitHub Pages状況確認**
   - リポジトリ: https://github.com/d71280/mitoseika
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)

2. **デプロイ状況確認**
   - Actions タブでワークフロー実行状況を確認
   - 最新のデプロイが成功していることを確認

### 4. 動作確認手順

1. **直接GitHub Pagesにアクセス**
   ```
   https://d71280.github.io/mitoseika/liff.html
   ```

2. **LIFF URLでアクセス**
   ```
   https://liff.line.me/2007611355-MbZ09XRP
   ```

3. **期待される動作:**
   - LINE認証画面が表示される
   - 認証後、注文フォームが表示される
   - **Vercelログイン画面は表示されない**

### 5. トラブルシューティング

#### A. まだVercelログインが表示される場合

1. **ブラウザキャッシュクリア**
   - ブラウザのキャッシュとクッキーを削除
   - シークレットモードで再テスト

2. **LIFFキャッシュクリア**
   - LINE Developers Console → LIFF → キャッシュクリア

3. **DNS伝播確認**
   ```bash
   nslookup d71280.github.io
   ```

#### B. LIFF初期化エラーの場合

1. **コンソールログ確認**
   - F12 → Console でエラーログ確認
   - ネットワークタブで読み込み失敗確認

2. **LIFF ID確認**
   - 正しいLIFF IDが設定されているか確認

#### C. 認証ループの場合

1. **Scope設定確認**
   - profile openid が正しく設定されているか

2. **ボットリンク機能確認**
   - On に設定されているか

### 6. 最終確認チェックリスト

- [ ] LIFFエンドポイントURL: `https://d71280.github.io/mitoseika/liff.html`
- [ ] GitHub Pagesデプロイ成功
- [ ] liff.htmlが正しく配置されている
- [ ] LIFF ID: `2007611355-MbZ09XRP`
- [ ] Scope: profile openid
- [ ] ボットリンク機能: On
- [ ] ブラウザキャッシュクリア済み

### 7. 緊急対応（それでも解決しない場合）

#### 新しいLIFFアプリ作成

1. **新規LIFF作成**
   - LINE Developers Console → LIFF → 追加
   - 正しいエンドポイントURLで新規作成

2. **新しいLIFF IDを使用**
   ```javascript
   const LIFF_ID = 'NEW_LIFF_ID';
   ```

3. **コードプッシュ**
   ```bash
   git add .
   git commit -m "新しいLIFF IDに更新"
   git push
   ```

### 8. 現在の推奨設定

```
チャンネル: 水戸青果注文システム
LIFF ID: 2007611355-MbZ09XRP
エンドポイントURL: https://d71280.github.io/mitoseika/liff.html
サイズ: Full
Scope: profile openid
ボットリンク: On
```

## 重要なポイント

1. **絶対にVercelURLを使用しない**
2. **GitHub Pages URLのみ使用**
3. **エンドポイントURL変更後は数分待つ**
4. **キャッシュクリアを必ず実行**