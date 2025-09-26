<?php
// register.php
session_start();
?>
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>新規登録 | 物語灯花</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
  <?php include_once 'common/header.php'; ?>

  <main style="max-width:680px;margin:2.5rem auto 4rem;padding:0 1rem;">
    <h1 style="font-size:1.8rem;margin:0 0 .75rem;">新規登録</h1>

    <!-- type="button" に変更して、フォーム送信で二重実行されないように -->
    <form id="register-form">
      <div class="form-row" style="margin-bottom:1rem;">
        <label for="nickname" style="display:block;margin-bottom:.4rem;">ニックネーム</label>
        <input type="text" id="nickname" name="nickname" placeholder="例）灯花ユーザー"
               style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;" />
      </div>

      <div class="form-row" style="margin-bottom:1rem;">
        <label for="email" style="display:block;margin-bottom:.4rem;">メールアドレス</label>
        <input type="email" id="email" name="email" autocomplete="email" required
               style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;" />
      </div>

      <div class="form-row" style="margin-bottom:1.25rem;">
        <label for="password" style="display:block;margin-bottom:.4rem;">パスワード（6文字以上）</label>
        <input type="password" id="password" name="password" minlength="6" autocomplete="new-password" required
               style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:8px;" />
      </div>

      <!-- submit → button に変更 -->
      <button id="register-btn" type="button"
              style="padding:.65rem 1.2rem;border:1px solid #dcdcdc;border-radius:8px;background:#fff;cursor:pointer;">
        新規登録
      </button>

      <div id="auth-status" style="margin-top:1rem;color:#333;"></div>
    </form>

    <p style="margin-top:1.25rem;color:#666;">
      すでにアカウントをお持ちの方は
      <a href="login.php" style="text-decoration:none;">
        <span style="text-decoration:underline;text-underline-offset:.15em;">こちら</span>
      </a>
      からログイン
    </p>
  </main>

  <!-- 登録処理・ログイン状態の切替は auth.js が担当 -->
  <script type="module" src="auth.js"></script>
</body>
</html>
