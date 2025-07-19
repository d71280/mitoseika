# LIFF（LINE Front-end Framework）設定手順

## 概要
認証なしのLIFFアプリを作成し、LINE内でWebアプリを表示できるようにします。

## 設定手順

### 1. LINE Developersコンソールでの設定

1. **LINE Developers Console**にアクセス
   - https://developers.line.biz/console/

2. **チャンネルを作成**
   - 「新規チャンネル作成」→「Messaging API」を選択
   - チャンネル名: 「水戸青果注文システム」
   - チャンネル説明: 「青果注文用LIFF」
   - 業種: 「小売業」

3. **LIFFアプリを追加**
   - チャンネル設定の「LIFF」タブを選択
   - 「追加」ボタンをクリック
   - 設定値:
     ```
     LIFFアプリ名: 水戸青果注文システム
     サイズ: Full
     エンドポイントURL: https://d71280.github.io/mitoseika/liff.html
     Scope: なし（認証なしのため）
     ボットリンク機能: Off
     ```

4. **LIFF IDをコピー**
   - 作成されたLIFF IDをメモ（例: 1234567890-abcdefgh）

### 2. HTMLファイルの更新

`liff.html`の以下の行を更新:

```javascript
// LIFF IDを設定（実際のIDに置き換え）
liff.init({ liffId: 'YOUR_LIFF_ID_HERE' })
```

### 3. LINE Botの設定

1. **Messaging API設定**
   - Webhook URL: （必要に応じて）
   - 自動応答メッセージ: 無効
   - あいさつメッセージ: 有効

2. **リッチメニュー作成**
   ```json
   {
     "size": {
       "width": 2500,
       "height": 1686
     },
     "selected": false,
     "name": "注文メニュー",
     "chatBarText": "注文する",
     "areas": [
       {
         "bounds": {
           "x": 0,
           "y": 0,
           "width": 2500,
           "height": 1686
         },
         "action": {
           "type": "uri",
           "uri": "https://liff.line.me/YOUR_LIFF_ID"
         }
       }
     ]
   }
   ```

### 4. テスト方法

1. **友だち追加**
   - QRコードまたはチャンネルIDで友だち追加

2. **LIFF起動**
   - トーク画面でLIFFボタンをタップ
   - または直接URL: `https://liff.line.me/YOUR_LIFF_ID`

3. **動作確認**
   - 顧客ID入力
   - 商品選択
   - 注文送信

## 設定ファイル

### 必要なファイル
- `liff.html` - LIFFアプリ本体
- 本ファイル（設定手順書）

### デプロイ先
- GitHub Pages: https://d71280.github.io/mitoseika/liff.html
- または任意のWebサーバー

## 注意事項

1. **認証なし設定**
   - ユーザー情報の自動取得はできません
   - 顧客IDの手動入力が必要です

2. **HTTPS必須**
   - LIFFはHTTPS環境でのみ動作します

3. **モバイル最適化**
   - スマートフォン表示に最適化されています

4. **LINE内ブラウザ**
   - LINE内のWebViewで表示されます

## トラブルシューティング

### よくある問題

1. **LIFF IDが無効**
   - LINE Developersコンソールで正しいIDを確認

2. **ページが表示されない**
   - HTTPS確認
   - URL正確性確認

3. **送信機能が動作しない**
   - バックエンドAPI接続確認
   - CORS設定確認

## 次のステップ

1. LIFF IDの設定
2. リッチメニューの作成
3. 友だち追加とテスト
4. 本番運用開始