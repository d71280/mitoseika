# LIFF（LINE Front-end Framework）環境設定手順

## 必要な環境設定

### 1. LINE Developers Console設定

1. **LINE Developers Console**にアクセス
   - https://developers.line.biz/console/

2. **Messaging APIチャンネル作成**
   - 「新規チャンネル作成」→「Messaging API」を選択
   - チャンネル名: 「水戸青果注文システム」
   - チャンネル説明: 「青果注文用LIFF」
   - 業種: 「小売業」

3. **LIFFアプリ追加**
   - チャンネル設定の「LIFF」タブを選択
   - 「追加」ボタンをクリック
   - **重要な設定値:**
     ```
     LIFFアプリ名: 水戸青果注文システム
     サイズ: Full
     エンドポイントURL: https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/liff.html
     Scope: profile openid
     ボットリンク機能: On
     ```

4. **LIFF IDをコピー**
   - 作成されたLIFF IDをコピー（例: 2007611355-MbZ09XRP）

### 2. GitHub Pages設定

1. **GitHubリポジトリ設定**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)

2. **エンドポイントURL確認**
   - `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/liff.html`
   - 実際のURL例: `https://d71280.github.io/mitoseika/liff.html`

### 3. LIFF認証に必要な設定

#### A. LIFFアプリのScope設定
```
profile: ユーザーのプロフィール情報取得
openid: OpenID Connect認証
```

#### B. 認証フロー
1. ユーザーがLIFF URLにアクセス
2. LINE認証が自動実行（未ログインの場合）
3. 認証後、ユーザープロフィール取得
4. アプリ表示

#### C. 必要な権限
- **プロフィール取得権限**: `liff.getProfile()`
- **メッセージ送信権限**: `liff.sendMessages()`

### 4. 設定確認手順

1. **LIFF ID更新**
   - `liff.html`の`LIFF_ID`を実際のIDに更新
   ```javascript
   const LIFF_ID = 'YOUR_ACTUAL_LIFF_ID';
   ```

2. **エンドポイントURL更新**
   - LINE Developers ConsoleでエンドポイントURLを正しいGitHub Pages URLに設定

3. **HTTPS確認**
   - LIFFはHTTPS必須
   - GitHub Pagesは自動でHTTPS提供

### 5. テスト手順

1. **友だち追加**
   - LINE Developers ConsoleでQRコード取得
   - テスト用LINEアカウントで友だち追加

2. **LIFF起動テスト**
   - 直接LIFF URL: `https://liff.line.me/YOUR_LIFF_ID`
   - または、LINEトーク画面からアクセス

3. **認証確認**
   - LINE認証画面表示
   - 認証後、ユーザー名表示確認

### 6. トラブルシューティング

#### よくある問題と解決方法

1. **LIFF IDが無効**
   ```
   エラー: LIFF ID not found
   解決: LINE Developers Consoleで正しいIDを確認
   ```

2. **エンドポイントURLエラー**
   ```
   エラー: Invalid endpoint URL
   解決: HTTPS URL、GitHub Pagesの正確なパス確認
   ```

3. **認証が動作しない**
   ```
   エラー: Authentication failed
   解決: Scope設定（profile openid）を確認
   ```

4. **Vercelログイン画面表示**
   ```
   問題: Vercelのログインが要求される
   解決: GitHub Pagesを使用（HTTPS公開済み）
   ```

### 7. 現在の設定状況

- **LIFF ID**: `2007611355-MbZ09XRP`
- **エンドポイントURL**: `https://d71280.github.io/mitoseika/liff.html`
- **認証**: LINE認証必須
- **機能**: プロフィール取得、メッセージ送信

### 8. 本番運用チェックリスト

- [ ] LIFF IDが正しく設定されている
- [ ] エンドポイントURLがGitHub Pagesに設定されている
- [ ] HTTPS接続が確認できる
- [ ] LINE認証が正常に動作する
- [ ] ユーザープロフィールが取得できる
- [ ] 注文送信機能が動作する
- [ ] リッチメニューまたは友だち追加が完了している

## 重要な注意事項

1. **HTTPS必須**: LIFFはHTTPS環境でのみ動作
2. **認証必須**: プロフィール取得にはLINE認証が必要
3. **モバイル最適化**: スマートフォン表示専用
4. **LINE内ブラウザ**: LINE WebViewでの表示
5. **LIFF SDK**: 必須ライブラリの読み込み確認