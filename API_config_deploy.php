<?php
// API_config.php
// API設定ファイル - 本ファイルはGitにコミットしないでください

// OpenAI API設定
$config = [
    'openai' => [
        'api_key' => 'YOUR_OPENAI_API_KEY_HERE',
        'base_url' => 'https://api.openai.com/v1',
        'timeout' => 30
    ]
];

// 将来的に他のAPIも追加可能
// 'firebase' => [...],
// 'other_api' => [...]

return $config;
?>
