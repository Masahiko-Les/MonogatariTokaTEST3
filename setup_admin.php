<?php
// setup_admin.php - 開発用管理者設定ページ
session_start();
?>
<!doctype html>
<html lang="ja">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>管理者設定 | 物語灯花</title>
  <?php include 'common/head.php'; ?>
  <style>
    .setup-container {
      max-width: 600px;
      margin: 3rem auto;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      text-align: center;
    }
    
    .warning {
      background: #fff3cd;
      color: #856404;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 2rem;
      border: 1px solid #ffeaa7;
    }
    
    .setup-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      margin: 0.5rem;
    }
    
    .setup-btn:hover {
      background: #0056b3;
    }
    
    .check-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      margin: 0.5rem;
    }
    
    .check-btn:hover {
      background: #545b62;
    }
    
    #setup-status {
      margin-top: 2rem;
      padding: 1rem;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <?php include_once 'common/header.php'; ?>

  <main class="setup-container">
    <h1>🔧 管理者権限設定</h1>
    
    <div class="warning">
      <strong>⚠️ 開発用ページです</strong><br>
      本番環境では削除してください。
    </div>
    
    <p>現在ログインしているユーザーを管理者に設定します。</p>
    
    <div>
      <button id="check-role-btn" class="check-btn">現在の権限を確認</button>
      <button id="setup-admin-btn" class="setup-btn">管理者権限を設定</button>
    </div>
    
    <div id="setup-status"></div>
    
    <div style="margin-top: 2rem;">
      <a href="Admin_page.php" style="color: #007bff;">管理者ページへ</a>
    </div>
  </main>

  <script type="module" src="auth.js"></script>
  <script type="module" src="setup_admin.js"></script>
</body>
</html>