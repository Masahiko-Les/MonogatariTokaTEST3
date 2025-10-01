# API設定セットアップ手順

## 初回セットアップ

1. **API設定ファイルの作成**
   ```bash
   cp API_config.template.php API_config.php
   ```

2. **OpenAI APIキーの設定**
   - [OpenAI Platform](https://platform.openai.com/api-keys) でAPIキーを取得
   - `API_config.php` を開く
   - `YOUR_OPENAI_API_KEY_HERE` を実際のAPIキーに置き換える

3. **設定確認**
   - ブラウザで moderation_check.php にアクセスしてエラーが出ないことを確認

## ファイル説明

- `API_config.template.php`: テンプレートファイル（Git管理対象）
- `API_config.php`: 実際の設定ファイル（Git除外）
- `moderation_check.php`: OpenAI Moderation API呼び出し処理（Git除外）

## セキュリティ注意事項

- `API_config.php` は絶対にGitにコミットしないでください
- APIキーは環境変数での管理も推奨されます
- 本番環境では適切なアクセス制限を設定してください

## トラブルシューティング

- **"OpenAI API key is not configured properly"** エラー
  - API_config.php でAPIキーが正しく設定されているか確認
  
- **APIリクエストエラー**
  - APIキーの有効性を確認
  - OpenAIアカウントの利用制限を確認