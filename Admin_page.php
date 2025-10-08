<?php
// Admin_page.php
session_start();
?>
<!doctype html>
<html lang="ja">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>管理者ページ | 物語灯花</title>
  <?php include 'common/head.php'; ?>
  <style>
    .admin-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    
    .admin-header {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border-left: 4px solid #007bff;
    }
    
    .pending-story {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .story-meta {
      background: #f8f9fa;
      padding: 0.8rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #666;
    }
    
    .story-content {
      line-height: 1.6;
      margin-bottom: 1.5rem;
      white-space: pre-wrap;
    }
    
    .admin-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .approve-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .approve-btn:hover {
      background: #218838;
    }
    
    .reject-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .reject-btn:hover {
      background: #c82333;
    }
    
    .no-pending {
      text-align: center;
      padding: 3rem;
      color: #666;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    .ai-check-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .ai-check-btn:hover {
      background: #0056b3;
    }
    
    .ai-check-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    
    .ai-result {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #007bff;
      background: #f8f9fa;
    }
    
    .ai-result.warning {
      border-left-color: #ffc107;
      background: #fff3cd;
    }
    
    .ai-result.error {
      border-left-color: #dc3545;
      background: #f8d7da;
    }
    
    .ai-result h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    
    .ai-result .detected-categories {
      margin: 0.5rem 0;
    }
    
    .ai-result .category-tag {
      display: inline-block;
      background: #dc3545;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 3px;
      font-size: 0.8rem;
      margin: 0.2rem;
    }
  </style>
</head>
<body>
  <?php include_once 'common/header.php'; ?>

  <main class="admin-container">
    <div class="admin-header">
      <h1>管理者ページ</h1>
      <p>承認待ちのストーリーを確認し、公開の可否を判断してください。</p>
    </div>

    <!-- ログイン必須メッセージ -->
    <div id="login-required" style="display:none;" class="no-pending">
      <h3>ログインが必要です</h3>
      <p>管理者ページにアクセスするにはログインしてください。</p>
      <a href="login.php" style="color: #007bff;">ログインページへ</a>
    </div>

    <!-- 権限なしメッセージ -->
    <div id="no-permission" style="display:none;" class="no-pending">
      <h3>アクセス権限がありません</h3>
      <p>このページは管理者のみアクセス可能です。</p>
    </div>

    <!-- ローディング -->
    <div id="loading" class="loading">
      承認待ちストーリーを読み込み中...
    </div>

    <!-- 承認待ちストーリー一覧 -->
    <div id="pending-stories">
      <!-- ここに承認待ちストーリーが表示される -->
    </div>

    <!-- 承認待ちなし -->
    <div id="no-pending-stories" style="display:none;" class="no-pending">
      <h3>✅ 承認待ちのストーリーはありません</h3>
      <p>現在、承認が必要なストーリーはありません。</p>
    </div>
  </main>

  <script type="module" src="admin.js?v=<?php echo time(); ?>"></script>
</body>
</html>