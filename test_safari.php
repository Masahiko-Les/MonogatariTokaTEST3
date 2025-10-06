<?php
// test_safari.php - iPhone Safari問題診断
session_start();
?>
<!doctype html>
<html lang="ja">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Safari問題診断</title>
</head>
<body>
  <h1>🍎 Safari問題診断</h1>
  
  <div id="info" style="background:#f0f0f0;padding:15px;margin:10px 0;border-radius:5px;">
    <h3>ブラウザ情報</h3>
    <p><strong>User Agent:</strong><br><?php echo htmlspecialchars($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'); ?></p>
  </div>

  <div id="status" style="background:#e8f5e8;padding:15px;margin:10px 0;border-radius:5px;">
    <h3>ステータス</h3>
    <p id="status-text">⏳ 初期化中...</p>
  </div>

  <!-- テスト用モーダル -->
  <div id="test-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center;">
    <div style="background:white;padding:30px;border-radius:10px;text-align:center;max-width:300px;">
      <h3>テストモーダル</h3>
      <p>モーダルが正常に表示されました！</p>
      <button onclick="hideModal()" style="padding:10px 20px;background:#007bff;color:white;border:none;border-radius:5px;">
        閉じる
      </button>
    </div>
  </div>

  <!-- テスト用フォーム -->
  <form id="test-form" style="display:none;background:#fff3cd;padding:20px;margin:10px 0;border-radius:5px;">
    <h3>テストフォーム</h3>
    <div style="margin:10px 0;">
      <label>タイトル:</label>
      <input type="text" placeholder="テスト入力" style="width:100%;padding:5px;margin:5px 0;">
    </div>
    <div style="margin:10px 0;">
      <label>内容:</label>
      <textarea rows="3" placeholder="テスト内容" style="width:100%;padding:5px;margin:5px 0;"></textarea>
    </div>
    <button type="button" style="padding:8px 16px;background:#28a745;color:white;border:none;border-radius:5px;">
      テスト送信
    </button>
  </form>

  <div style="margin:20px 0;">
    <button onclick="showModal()" style="padding:10px 20px;margin:5px;background:#007bff;color:white;border:none;border-radius:5px;">
      モーダル表示テスト
    </button>
    <button onclick="toggleForm()" style="padding:10px 20px;margin:5px;background:#28a745;color:white;border:none;border-radius:5px;">
      フォーム表示テスト
    </button>
  </div>

  <div style="background:#f8d7da;padding:15px;margin:10px 0;border-radius:5px;">
    <h3>🎯 期待される動作</h3>
    <ul>
      <li>ページ読み込み後にステータスが「準備完了」になる</li>
      <li>「モーダル表示テスト」でモーダルが表示される</li>
      <li>「フォーム表示テスト」でフォームが表示される</li>
    </ul>
  </div>

  <script>
  // ステータス更新関数
  function updateStatus(message, color) {
    document.getElementById('status-text').textContent = message;
    document.getElementById('status').style.backgroundColor = color || '#e8f5e8';
    console.log('Status:', message);
  }

  // モーダル表示
  function showModal() {
    document.getElementById('test-modal').style.display = 'flex';
    updateStatus('✅ モーダル表示成功', '#d4edda');
  }

  // モーダル非表示
  function hideModal() {
    document.getElementById('test-modal').style.display = 'none';
    updateStatus('✅ モーダル非表示成功', '#d4edda');
  }

  // フォーム表示切り替え
  function toggleForm() {
    const form = document.getElementById('test-form');
    if (form.style.display === 'none' || form.style.display === '') {
      form.style.display = 'block';
      updateStatus('✅ フォーム表示成功', '#d4edda');
    } else {
      form.style.display = 'none';
      updateStatus('✅ フォーム非表示成功', '#d4edda');
    }
  }

  // DOMContentLoaded イベント
  document.addEventListener('DOMContentLoaded', function() {
    updateStatus('✅ DOMContentLoaded発火 - 準備完了', '#d4edda');
    
    // 基本機能テスト
    try {
      // DOM要素チェック
      const modal = document.getElementById('test-modal');
      const form = document.getElementById('test-form');
      
      if (!modal) {
        updateStatus('❌ モーダル要素が見つかりません', '#f8d7da');
        return;
      }
      
      if (!form) {
        updateStatus('❌ フォーム要素が見つかりません', '#f8d7da');
        return;
      }
      
      updateStatus('✅ 全ての要素が見つかりました - テスト可能', '#d4edda');
      
    } catch (error) {
      updateStatus('❌ JavaScript エラー: ' + error.message, '#f8d7da');
    }
  });

  // エラーハンドリング
  window.addEventListener('error', function(event) {
    updateStatus('❌ エラー: ' + event.message, '#f8d7da');
    console.error('Error:', event);
  });

  window.addEventListener('unhandledrejection', function(event) {
    updateStatus('❌ Promise エラー: ' + event.reason, '#f8d7da');
    console.error('Promise error:', event);
  });
  </script>
</body>
</html>