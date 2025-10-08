<?php
/**
 * moderation_check.php
 * OpenAI Moderation APIを使用してコンテンツの安全性をチェック
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// プリフライトリクエストの処理
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// POSTリクエストのみ受け付け
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// リクエストボディを取得
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['chunks'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

// API設定ファイルを読み込み
if (file_exists('API_config.php')) {
    $config = require_once 'API_config.php';
    
    if (isset($config['openai']['api_key'])) {
        $openai_api_key = $config['openai']['api_key'];
    } else {
        error_log("OpenAI API key not found in config");
        echo json_encode([
            'safe' => true,
            'flagged' => false,
            'error' => 'API configuration not found'
        ]);
        exit;
    }
} else {
    // API_config.phpが存在しない場合のエラー
    error_log("API_config.php not found");
    echo json_encode([
        'safe' => true,
        'flagged' => false,
        'error' => 'API configuration not available'
    ]);
    exit;
}

// OpenAI API キーが設定されているかチェック
if (empty($openai_api_key) || $openai_api_key === 'YOUR_OPENAI_API_KEY_HERE') {
    error_log("OpenAI API key not configured");
    echo json_encode([
        'safe' => true,
        'flagged' => false,
        'error' => 'API key not configured'
    ]);
    exit;
}

/**
 * OpenAI Moderation APIを呼び出す
 */
function checkModeration($text, $api_key) {
    $url = 'https://api.openai.com/v1/moderations';
    $headers = [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $api_key
    ];
    
    $payload = json_encode([
        'input' => $text
    ]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_error($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception("CURL Error: " . $error);
    }
    
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("API Error: HTTP " . $httpCode . " - " . $response);
    }
    
    return json_decode($response, true);
}

try {
    $chunks = $data['chunks'];
    $flaggedChunks = [];
    $overallFlagged = false;
    
    foreach ($chunks as $chunk) {
        if (!isset($chunk['text']) || empty(trim($chunk['text']))) {
            continue;
        }
        
        $text = trim($chunk['text']);
        $section = $chunk['section'] ?? 'Unknown section';
        
        // OpenAI Moderation APIを呼び出し
        $moderationResult = checkModeration($text, $openai_api_key);
        
        if (isset($moderationResult['results'][0])) {
            $result = $moderationResult['results'][0];
            
            if ($result['flagged']) {
                $overallFlagged = true;
                
                // フラグされたカテゴリを取得
                $flaggedCategories = [];
                if (isset($result['categories'])) {
                    foreach ($result['categories'] as $category => $flagged) {
                        if ($flagged) {
                            $flaggedCategories[] = $category;
                        }
                    }
                }
                
                $flaggedChunks[] = [
                    'section' => $section,
                    'text' => $text,
                    'categories' => $result['categories'],
                    'flagged_categories' => $flaggedCategories,
                    'category_scores' => $result['category_scores'] ?? []
                ];
            }
        }
        
        // API制限対策として短い遅延
        usleep(100000); // 0.1秒
    }
    
    $response = [
        'safe' => !$overallFlagged,
        'flagged' => $overallFlagged,
        'flagged_chunks' => $flaggedChunks,
        'total_chunks' => count($chunks),
        'flagged_count' => count($flaggedChunks)
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Moderation check error: " . $e->getMessage());
    
    // エラーが発生した場合は安全側に倒して通す（サービス継続性のため）
    echo json_encode([
        'safe' => true,
        'flagged' => false,
        'error' => $e->getMessage(),
        'note' => 'Service continued despite moderation error'
    ]);
}
?>