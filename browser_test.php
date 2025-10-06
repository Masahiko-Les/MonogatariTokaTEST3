<?php
// browser_test.php - ブラウザ判定テスト
session_start();

function analyzeBrowser() {
  $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
  
  // 各種判定
  $hasChrome = strpos($userAgent, 'Chrome') !== false;
  $hasChromium = strpos($userAgent, 'Chromium') !== false;
  $hasSafari = strpos($userAgent, 'Safari') !== false;
  $hasIPhone = strpos($userAgent, 'iPhone') !== false;
  $hasAndroid = strpos($userAgent, 'Android') !== false;
  $hasEdge = strpos($userAgent, 'Edge') !== false;
  $hasFirefox = strpos($userAgent, 'Firefox') !== false;
  
  // Chrome系判定
  $isChrome = $hasChrome || $hasChromium || $hasEdge;
  
  // Safari判定（Chrome系以外）
  $isSafari = $hasSafari && !$isChrome;
  
  // iPhone Safari判定
  $isIPhoneSafari = $hasIPhone && $hasSafari && !$isChrome;
  
  // Android Safari判定
  $isAndroidSafari = $hasAndroid && $hasSafari && !$isChrome;
  
  return [
    'userAgent' => $userAgent,
    'hasChrome' => $hasChrome,
    'hasChromium' => $hasChromium,
    'hasSafari' => $hasSafari,
    'hasIPhone' => $hasIPhone,
    'hasAndroid' => $hasAndroid,
    'hasEdge' => $hasEdge,
    'hasFirefox' => $hasFirefox,
    'isChrome' => $isChrome,
    'isSafari' => $isSafari,
    'isIPhoneSafari' => $isIPhoneSafari,
    'isAndroidSafari' => $isAndroidSafari,
    'shouldRedirect' => $isSafari || $isIPhoneSafari || $isAndroidSafari
  ];
}

$analysis = analyzeBrowser();
?>
<!doctype html>
<html lang="ja">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ブラウザ判定テスト</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    .result { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
    .true { color: #28a745; font-weight: bold; }
    .false { color: #dc3545; }
    .redirect-yes { background: #d4edda; border-left-color: #28a745; }
    .redirect-no { background: #f8d7da; border-left-color: #dc3545; }
    .user-agent { word-break: break-all; font-family: monospace; background: #e9ecef; padding: 10px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>🔍 ブラウザ判定テスト</h1>
  
  <div class="result">
    <h3>📱 User Agent</h3>
    <div class="user-agent"><?php echo htmlspecialchars($analysis['userAgent']); ?></div>
  </div>

  <div class="result">
    <h3>🔍 検出された文字列</h3>
    <p>Chrome: <span class="<?php echo $analysis['hasChrome'] ? 'true' : 'false'; ?>"><?php echo $analysis['hasChrome'] ? 'あり' : 'なし'; ?></span></p>
    <p>Chromium: <span class="<?php echo $analysis['hasChromium'] ? 'true' : 'false'; ?>"><?php echo $analysis['hasChromium'] ? 'あり' : 'なし'; ?></span></p>
    <p>Safari: <span class="<?php echo $analysis['hasSafari'] ? 'true' : 'false'; ?>"><?php echo $analysis['hasSafari'] ? 'あり' : 'なし'; ?></span></p>
    <p>iPhone: <span class="<?php echo $analysis['hasIPhone'] ? 'true' : 'false'; ?>"><?php echo $analysis['hasIPhone'] ? 'あり' : 'なし'; ?></span></p>
    <p>Android: <span class="<?php echo $analysis['hasAndroid'] ? 'true' : 'false'; ?>"><?php echo $analysis['hasAndroid'] ? 'あり' : 'なし'; ?></span></p>
    <p>Edge: <span class="<?php echo $analysis['hasEdge'] ? 'true' : 'false'; ?>"><?php echo $analysis['hasEdge'] ? 'あり' : 'なし'; ?></span></p>
    <p>Firefox: <span class="<?php echo $analysis['hasFirefox'] ? 'true' : 'false'; ?>"><?php echo $analysis['hasFirefox'] ? 'あり' : 'なし'; ?></span></p>
  </div>

  <div class="result">
    <h3>🎯 判定結果</h3>
    <p>Chrome系ブラウザ: <span class="<?php echo $analysis['isChrome'] ? 'true' : 'false'; ?>"><?php echo $analysis['isChrome'] ? 'Yes' : 'No'; ?></span></p>
    <p>Safari系ブラウザ: <span class="<?php echo $analysis['isSafari'] ? 'true' : 'false'; ?>"><?php echo $analysis['isSafari'] ? 'Yes' : 'No'; ?></span></p>
    <p>iPhone Safari: <span class="<?php echo $analysis['isIPhoneSafari'] ? 'true' : 'false'; ?>"><?php echo $analysis['isIPhoneSafari'] ? 'Yes' : 'No'; ?></span></p>
    <p>Android Safari: <span class="<?php echo $analysis['isAndroidSafari'] ? 'true' : 'false'; ?>"><?php echo $analysis['isAndroidSafari'] ? 'Yes' : 'No'; ?></span></p>
  </div>

  <div class="result <?php echo $analysis['shouldRedirect'] ? 'redirect-yes' : 'redirect-no'; ?>">
    <h3>🚀 リダイレクト判定</h3>
    <p><strong><?php echo $analysis['shouldRedirect'] ? 'Safari版にリダイレクトされます' : '通常版を表示します'; ?></strong></p>
  </div>

  <div class="result">
    <h3>🧪 テストリンク</h3>
    <p><a href="post.php" style="color: #007bff;">post.php</a> - 自動判定でリダイレクト</p>
    <p><a href="post_safari.php" style="color: #28a745;">post_safari.php</a> - Safari版直接アクセス</p>
    <p><a href="test_safari.php" style="color: #ffc107;">test_safari.php</a> - 基本動作テスト</p>
  </div>

  <div class="result">
    <h3>📋 期待される動作</h3>
    <ul>
      <li><strong>iPhone Safari:</strong> Safari版にリダイレクト</li>
      <li><strong>iPhone Chrome:</strong> 通常版を表示</li>
      <li><strong>PC Chrome:</strong> 通常版を表示</li>
      <li><strong>PC Safari:</strong> Safari版にリダイレクト</li>
    </ul>
  </div>
</body>
</html>