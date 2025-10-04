# FileZillaを使った本番デプロイ手順

## 🚀 FileZillaでのデプロイ完全ガイド

### 📋 事前準備

#### 1. 必要な情報を準備
- **FTPホスト**: サーバーのFTPアドレス
- **ユーザー名**: FTPユーザー名
- **パスワード**: FTPパスワード
- **ポート**: 通常21（SFTP使用の場合は22）
- **プロトコル**: SFTP（推奨）またはFTP

#### 2. 本番環境用ファイルの準備

##### 手順A: 機密ファイルを本番用に変更
```bash
# 現在のディレクトリで実行
cd "c:\xampp\htdocs\gs_code\StoryDatabase\f_ver1"

# API設定を本番用にコピー
copy API_config.production.php API_config.php

# Firebase設定を本番用にコピー（要編集）
copy firebaseConfig.production.js firebaseConfig.js
```

##### 手順B: 本番用Firebase設定の編集
`firebaseConfig.js` を開いて以下を実際の値に変更：
```javascript
const firebaseConfig = {
  apiKey: "あなたの実際のFirebase APIキー",
  authDomain: "あなたのプロジェクト名.firebaseapp.com",
  projectId: "あなたのプロジェクトID",
  storageBucket: "あなたのプロジェクト名.firebasestorage.app",
  messagingSenderId: "あなたのメッセージングID",
  appId: "あなたのアプリID"
};
```

##### 手順C: API設定の編集
`API_config.php` を開いて：
```php
'api_key' => 'あなたの実際のOpenAI APIキー',
```

---

## 📁 FileZillaでのアップロード手順

### ステップ1: FileZilla接続設定

1. **FileZillaを起動**
2. **サイトマネージャーを開く**
   - `ファイル` → `サイトマネージャー`
3. **新しいサイトを作成**
   ```
   ホスト: あなたのサーバーのFTPアドレス
   プロトコル: SFTP - SSH File Transfer Protocol（推奨）
   ログインタイプ: 通常
   ユーザー: あなたのFTPユーザー名
   パスワード: あなたのFTPパスワード
   ```
4. **接続テスト**

### ステップ2: ファイル構造の確認

**ローカル側（左側パネル）**: 
```
c:\xampp\htdocs\gs_code\StoryDatabase\f_ver1\
```

**サーバー側（右側パネル）**: 
```
/public_html/  （または /htdocs/, /www/ など）
```

### ステップ3: アップロードするファイル

#### 🟢 必須ファイル（これらは必ずアップロード）
```
📄 index.php
📄 list.php
📄 post.php
📄 story_detail.php
📄 story_edit.php
📄 login.php
📄 register.php
📄 mypage.php
📄 Admin_page.php
📄 setup_admin.php
📄 this_site.php
📄 cleanup_summary_field.php
📄 moderation_check.php
📄 API_config.php ⚠️（編集済みの本番用）
📄 firebaseConfig.js ⚠️（編集済みの本番用）
📁 common/
   📄 head.php
   📄 header.php
   📄 footer.php
📁 css/
📁 img/
📄 style.css
📄 post.js
📄 mypage.js
📄 admin.js
📄 admin_utils.js
📄 auth.js
📄 setup_admin.js
📄 story_card.js
📄 story_load.js
```

#### 🔴 アップロードしてはいけないファイル
```
❌ .git/
❌ .gitignore
❌ API_config.production.php
❌ firebaseConfig.production.js
❌ API_config.template.php
❌ DEPLOYMENT.md
❌ API_SETUP.md
❌ *.md ファイル
```

### ステップ4: アップロード実行

1. **ローカル側でフォルダを選択**
   - `c:\xampp\htdocs\gs_code\StoryDatabase\f_ver1\` を開く

2. **必要なファイルを選択**
   - Ctrlキーを押しながら上記の必須ファイルを選択
   - または、フォルダ全体を選択してから不要ファイルを除外

3. **ドラッグ＆ドロップでアップロード**
   - 選択したファイルを右側（サーバー側）にドラッグ

4. **フォルダ構造を維持**
   - `common/`, `css/`, `img/` フォルダも同様にアップロード

---

## ⚙️ サーバー設定

### PHP設定の確認
サーバーで以下が有効になっているか確認：
```
- PHP 7.4以上
- cURL拡張
- allow_url_fopen = On
- max_execution_time = 60以上
```

### .htaccess設定（オプション）
ルートディレクトリに`.htaccess`を作成：
```apache
# HTTPS強制
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# セキュリティヘッダー
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
```

---

## 🔧 デプロイ後の設定

### 1. Firebaseセキュリティルール適用
Firebaseコンソールで以下を設定：
1. **Authentication** → **承認されたドメイン**に本番ドメインを追加
2. **Firestore** → **ルール**で、保存したルールを適用

### 2. 動作確認チェックリスト
- [ ] トップページが表示される
- [ ] ユーザー登録・ログインが動作する
- [ ] ストーリー投稿が動作する
- [ ] AIモデレーションが動作する
- [ ] 花束機能が動作する
- [ ] 管理者ページが動作する

### 3. エラーログの確認
サーバーのエラーログを確認し、問題がないかチェック

---

## 🚨 よくあるトラブルと対処法

### エラー: "OpenAI API key is not configured"
**原因**: API_config.phpの設定不備  
**解決**: APIキーが正しく設定されているか確認

### エラー: "Firebase connection failed"
**原因**: firebaseConfig.jsの設定不備  
**解決**: Firebase設定が正しいか確認

### エラー: "auth is not defined" または "db is not defined"
**原因**: JavaScriptファイルのインポートパス不備  
**解決**: `import { auth, db } from "./firebaseConfig.js";` が正しく設定されているか確認

### エラー: "Permission denied"
**原因**: ファイルの権限不備  
**解決**: PHPファイルを644、フォルダを755に設定

### ページが真っ白
**原因**: PHPエラー  
**解決**: エラーログを確認し、構文エラーを修正

### JavaScript関数が動作しない
**原因**: ファイル読み込み順序やインポートエラー  
**解決**: ブラウザの開発者ツールでコンソールエラーを確認

---

## 📞 サポート情報

デプロイで問題が発生した場合：
1. サーバーのエラーログを確認
2. ブラウザの開発者ツールでJavaScriptエラーを確認
3. FileZillaの転送ログを確認
4. ファイルの権限設定を確認

**重要**: 本番デプロイ前に必ずテスト環境で動作確認を行ってください！