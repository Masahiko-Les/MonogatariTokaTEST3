# 物語灯花 - 本番デプロイガイド

## 環境構築手順

### 1. 必要な環境変数の設定

本番環境では以下の環境変数を設定してください：

```bash
# OpenAI API Key
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 2. Firebase設定

`firebaseConfig.production.js`の以下の値を本番環境の実際の値に変更してください：

- `YOUR_FIREBASE_API_KEY`
- `YOUR_PROJECT.firebaseapp.com`
- `YOUR_PROJECT_ID`
- `YOUR_SENDER_ID`
- `YOUR_APP_ID`

### 3. ファイル名の変更

本番デプロイ時は以下のファイル名を変更してください：

```bash
# API設定
cp API_config.production.php API_config.php

# Firebase設定
cp firebaseConfig.production.js firebaseConfig.js
```

### 4. Firestore セキュリティルール

`firestore_rules_updated.txt`の内容をFirebaseコンソールで設定してください。

### 5. サーバー要件

- PHP 7.4以上
- cURL拡張有効
- HTTPS必須（本番環境）

### 6. セキュリティチェックリスト

- [ ] API_config.phpは.gitignoreに含まれている
- [ ] firebaseConfig.jsは.gitignoreに含まれている
- [ ] 本番環境でHTTPS使用
- [ ] Firestoreセキュリティルール適用済み
- [ ] 環境変数でAPIキー管理
- [ ] エラーログの定期監視

## トラブルシューティング

### OpenAI APIエラー
- 環境変数`OPENAI_API_KEY`が正しく設定されているか確認
- APIキーの有効性と残高を確認

### Firestoreエラー
- セキュリティルールが正しく設定されているか確認
- Firebase認証が正常に動作しているか確認

## 監視項目

- PHPエラーログ
- JavaScriptコンソールエラー
- Firebaseコンソールの使用量
- OpenAI APIの使用量と料金