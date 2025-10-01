<?php
// API_config.template.php
// API設定テンプレートファイル
// このファイルをAPI_config.phpにコピーして、実際のAPIキーを設定してください

// OpenAI API設定
$config = [
    'openai' => [
        'api_key' => 'YOUR_OPENAI_API_KEY_HERE', // https://platform.openai.com/api-keys で取得
        'base_url' => 'https://api.openai.com/v1',
        'timeout' => 30 // リクエストタイムアウト（秒）
    ]
];

// 将来的に他のAPIも追加可能
// 'firebase' => [
//     'api_key' => 'YOUR_FIREBASE_API_KEY',
//     'project_id' => 'your-project-id'
// ],
// 'other_api' => [
//     'api_key' => 'YOUR_OTHER_API_KEY',
//     'endpoint' => 'https://api.example.com'
// ]

return $config;
?>