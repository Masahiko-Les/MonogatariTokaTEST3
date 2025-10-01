<?php
// moderation_check.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// API設定を読み込み
$config = require_once 'API_config.php';
$openai_api_key = $config['openai']['api_key'];
$openai_base_url = $config['openai']['base_url'];
$timeout = $config['openai']['timeout'];

// API設定チェック
if ($openai_api_key === 'YOUR_OPENAI_API_KEY_HERE' || empty($openai_api_key)) {
    http_response_code(500);
    echo json_encode(['error' => 'OpenAI API key is not configured properly']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['chunks']) || !is_array($input['chunks']) || empty($input['chunks'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Chunks array is required']);
    exit;
}

$chunks = $input['chunks'];
$results = [];

foreach ($chunks as $index => $chunk) {
    if (empty($chunk['text'])) {
        continue;
    }
    
    // OpenAI Moderation API リクエスト
    $moderation_data = [
        'input' => $chunk['text']
    ];

    $curl = curl_init();

    curl_setopt_array($curl, [
        CURLOPT_URL => $openai_base_url . '/moderations',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($moderation_data),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $openai_api_key
        ],
        CURLOPT_TIMEOUT => $timeout
    ]);

    $response = curl_exec($curl);
    $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($curl);

    curl_close($curl);

    if ($curl_error) {
        http_response_code(500);
        echo json_encode(['error' => 'API request failed: ' . $curl_error]);
        exit;
    }

    if ($http_code !== 200) {
        http_response_code(500);
        echo json_encode(['error' => 'OpenAI API error: HTTP ' . $http_code]);
        exit;
    }

    $result = json_decode($response, true);

    if (!$result || !isset($result['results'])) {
        http_response_code(500);
        echo json_encode(['error' => 'Invalid API response']);
        exit;
    }

    // 結果を保存
    $chunk_result = [
        'section' => $chunk['section'],
        'text' => $chunk['text'],
        'flagged' => $result['results'][0]['flagged'],
        'categories' => $result['results'][0]['categories'],
        'category_scores' => $result['results'][0]['category_scores']
    ];
    
    $results[] = $chunk_result;
    
    // デバッグ用ログ
    error_log('Chunk result: ' . json_encode($chunk_result));
}

// 全体の安全性を判定
$overall_safe = true;
$flagged_chunks = [];

foreach ($results as $result) {
    if ($result['flagged']) {
        $overall_safe = false;
        // フラグされたチャンクに詳細情報を追加
        $flagged_chunk = $result;
        // どのカテゴリがフラグされたかを特定
        $flagged_categories = [];
        foreach ($result['categories'] as $category => $is_flagged) {
            if ($is_flagged) {
                $flagged_categories[] = $category;
            }
        }
        $flagged_chunk['flagged_categories'] = $flagged_categories;
        $flagged_chunks[] = $flagged_chunk;
    }
}

// レスポンスを返す
$response_data = [
    'safe' => $overall_safe,
    'flagged' => !$overall_safe,
    'chunks' => $results,
    'flaggedChunks' => $flagged_chunks  // キャメルケースに統一
];

// デバッグ用ログ
error_log('Moderation API Response: ' . json_encode($response_data));

echo json_encode($response_data);
?>