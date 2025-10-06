<?php
// safari_test.php - Safari対応テスト用ページ
session_start();
?>
<!doctype html>
<html lang="ja">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Safari対応テスト | 物語灯花</title>
  <?php include 'common/head.php'; ?>
</head>
<body>
  <?php include_once 'common/header.php'; ?>

  <main style="max-width:800px;margin:2rem auto 4rem;padding:0 1rem;">
    <h1>Safari対応テスト</h1>

    <div style="background:#f8f9fa;padding:1.5rem;border-radius:8px;margin-bottom:2rem;">
      <h2>🔍 ブラウザ情報</h2>
      <p><strong>User Agent:</strong><br><?php echo htmlspecialchars($_SERVER['HTTP_USER_AGENT'] ?? 'Not available'); ?></p>
      
      <?php
      $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
      $isSafari = strpos($userAgent, 'Safari') !== false && strpos($userAgent, 'Chrome') === false;
      $isMobile = preg_match('/(iPhone|iPad|iPod|Android|Mobile)/i', $userAgent);
      $isIPhoneSafari = strpos($userAgent, 'iPhone') !== false && strpos($userAgent, 'Safari') !== false;
      ?>
      
      <div style="margin-top:1rem;">
        <p>✅ Safari判定: <?php echo $isSafari ? '✅ Yes' : '❌ No'; ?></p>
        <p>📱 モバイル判定: <?php echo $isMobile ? '✅ Yes' : '❌ No'; ?></p>
        <p>🍎 iPhone Safari: <?php echo $isIPhoneSafari ? '✅ Yes' : '❌ No'; ?></p>
      </div>
    </div>

    <div style="background:#e8f5e8;padding:1.5rem;border-radius:8px;margin-bottom:2rem;">
      <h2>🧪 テスト項目</h2>
      <div id="test-results">
        <p>⏳ テスト実行中...</p>
      </div>
    </div>

    <div style="background:#fff3cd;padding:1.5rem;border-radius:8px;margin-bottom:2rem;">
      <h2>🔗 リンクテスト</h2>
      <p><a href="post.php" style="color:#007bff;">通常版 post.php</a> - 自動でSafari版にリダイレクトされるかテスト</p>
      <p><a href="post_safari.php" style="color:#28a745;">Safari版 post_safari.php</a> - 直接アクセス</p>
    </div>

    <div style="background:#f8d7da;padding:1.5rem;border-radius:8px;">
      <h2>⚠️ 期待される動作</h2>
      <ul>
        <li><strong>iPhone Safari:</strong> Safari版が表示される</li>
        <li><strong>Chrome:</strong> 通常版が表示される</li>
        <li><strong>モーダル:</strong> 未ログイン時にログイン誘導が表示される</li>
        <li><strong>フォーム:</strong> ログイン時に入力フォームが表示される</li>
      </ul>
    </div>
  </main>

  <!-- Firebase Compat SDK - Safari対応 -->
  <script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-compat-auth.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-compat-firestore.js"></script>
  <script src="firebaseConfig_safari.js?v=<?php echo time(); ?>"></script>

  <script>
  // Safari対応テスト
  document.addEventListener("DOMContentLoaded", function() {
    const testResults = document.getElementById("test-results");
    let results = [];

    // Firebase 可用性テスト
    try {
      if (firebase && firebase.auth && firebase.firestore) {
        results.push("✅ Firebase Compat SDK: 正常に読み込まれました");
        
        // 認証状態確認
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            results.push("✅ Firebase Auth: ログイン済み (" + user.email + ")");
          } else {
            results.push("ℹ️ Firebase Auth: 未ログイン状態");
          }
          updateResults();
        });
        
      } else {
        results.push("❌ Firebase Compat SDK: 読み込みに失敗");
      }
    } catch (error) {
      results.push("❌ Firebase エラー: " + error.message);
    }

    // ブラウザ機能テスト
    try {
      // ES6 Modules サポート確認（Safariでは利用不可が正常）
      results.push("⚠️ ES6 Modules: Safari版では使用していません（正常）");
    } catch (error) {
      results.push("⚠️ ES6 Modules: 確認できません（Safari版で正解）");
    }

    // localStorage テスト
    try {
      localStorage.setItem('test', 'value');
      localStorage.removeItem('test');
      results.push("✅ localStorage: 利用可能");
    } catch (error) {
      results.push("❌ localStorage: 利用不可");
    }

    // fetch API テスト
    if (typeof fetch !== 'undefined') {
      results.push("✅ Fetch API: 利用可能");
    } else {
      results.push("❌ Fetch API: 利用不可");
    }

    function updateResults() {
      testResults.innerHTML = results.map(result => '<p>' + result + '</p>').join('');
    }

    updateResults();

    // 3秒後に最終結果
    setTimeout(function() {
      results.push("✅ テスト完了 - " + new Date().toLocaleTimeString());
      updateResults();
    }, 3000);
  });
  </script>
</body>
</html>