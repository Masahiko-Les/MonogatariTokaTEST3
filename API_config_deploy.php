<?php
// API_config.production.php
// 本番環境用API設定ファイル - 環境変数を使用

// OpenAI API設定
$config = [
    'openai' => [
        'api_key' => $_ENV['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY') ?? 'YOUR_OPENAI_API_KEY_HERE',
        'base_url' => 'https://api.openai.com/v1',
        'timeout' => 30
    ]
];

// API設定チェック
if ($config['openai']['api_key'] === 'YOUR_OPENAI_API_KEY_HERE' || empty($config['openai']['api_key'])) {
    error_log('ERROR: OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
}

// 将来的に他のAPIも追加可能
// 'firebase' => [...],
// 'other_api' => [...]

return $config;
?>