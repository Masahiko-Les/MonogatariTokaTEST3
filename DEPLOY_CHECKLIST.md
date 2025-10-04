# 🚀 FileZillaデプロイ チェックリスト

## 📋 デプロイ前の準備（必須）

### ステップ1: 本番用設定ファイルの編集

#### 1.1 API設定ファイル
- [ ] `API_config_deploy.php` をテキストエディタで開く
- [ ] 以下の行を実際のAPIキーに変更：
```php
'api_key' => 'あなたの実際のOpenAI APIキー',
```
- [ ] ファイル名を `API_config.php` に変更

#### 1.2 Firebase設定ファイル  
- [ ] `firebaseConfig_deploy.js` をテキストエディタで開く
- [ ] 以下の値を実際の値に変更：
```javascript
apiKey: "あなたの実際のFirebase APIキー",
authDomain: "あなたのプロジェクト名.firebaseapp.com", 
projectId: "あなたのプロジェクトID",
storageBucket: "あなたのプロジェクト名.firebasestorage.app",
messagingSenderId: "あなたのメッセージングID",
appId: "あなたのアプリID"
```
- [ ] ファイル名を `firebaseConfig.js` に変更

---

## 📁 FileZillaアップロード対象ファイル

### ✅ アップロードするファイル
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
📄 API_config.php ⚠️（編集後）
📄 firebaseConfig.js ⚠️（編集後）
📄 .htaccess ⚠️（セキュリティ設定）
📄 style.css
📄 post.js ⚠️（console.log削除済み）
📄 mypage.js
📄 admin.js
📄 admin_utils.js
📄 auth.js
📄 setup_admin.js
📄 story_card.js
📄 story_load.js
📁 common/ （フォルダごと）
📁 css/ （フォルダごと）
📁 img/ （フォルダごと）
```

### ❌ アップロードしないファイル
```
❌ .git/ 
❌ .gitignore
❌ *.md ファイル（ドキュメント）
❌ API_config.production.php
❌ firebaseConfig.production.js  
❌ API_config.template.php
❌ *_deploy.php, *_deploy.js（作業用ファイル）
```

---

## 🔧 FileZilla設定手順

### 1. 接続設定
- [ ] FileZillaを起動
- [ ] サイトマネージャーを開く（Ctrl+S）
- [ ] 新しいサイトを作成
- [ ] 接続情報を入力（ホスト、ユーザー名、パスワード）
- [ ] プロトコル: SFTP推奨
- [ ] 接続テスト実行

### 2. アップロード実行
- [ ] ローカル側: プロジェクトフォルダを選択
- [ ] サーバー側: public_html/ または htdocs/ を選択
- [ ] 上記チェックリストのファイルをドラッグ&ドロップ
- [ ] フォルダ構造が正しく維持されているか確認

---

## ✅ デプロイ後の確認

### 動作確認
- [ ] トップページにアクセス
- [ ] ユーザー登録・ログイン
- [ ] ストーリー投稿テスト
- [ ] AIモデレーション動作確認
- [ ] 花束機能テスト
- [ ] 管理者ページアクセス

### エラーチェック
- [ ] ブラウザの開発者ツールでJavaScriptエラー確認
- [ ] サーバーエラーログ確認
- [ ] Firebaseコンソールでエラーログ確認

---

## 🚨 緊急時の対処

### もしエラーが発生したら：
1. **即座にサイトを一時停止**（メンテナンスページ設置）
2. **エラーログを確認**
3. **問題のあるファイルを特定**
4. **ローカルで修正後、再アップロード**

### バックアップ：
- [ ] デプロイ前にサーバーの既存ファイルをバックアップ
- [ ] 万が一の時は元のファイルに戻す

---

**⚠️ 重要**: 本番デプロイは慎重に行い、必ず事前にバックアップを取ってください！