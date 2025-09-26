<!DOCTYPE html>
<html lang="ja">
<head>
  <title>ログイン | 物語灯花</title>
  <?php include 'common/head.php'; ?>
</head>
<body>
  <?php include 'common/header.php'; ?>
  
  <div class="form-container">
    <h2>ログイン</h2>
    <div class="form-group">
      <label for="email">メールアドレス</label>
      <input type="email" id="email" required>
    </div>
    <div class="form-group">
      <label for="password">パスワード</label>
      <input type="password" id="password" required>
    </div>
    <button id="login-btn" class="submit-button">ログイン</button>
    
    <div id="auth-status"></div><!-- ログイン成功の表示 -->


  <a href="register.php" class="inline-link">
    <span class="only-underline">新規アカウント作成</span>
  </a>

</div>

  <script type="module" src="auth.js"></script>
</body>
</html>

<style>
  /* ===== ログイン・登録フォーム ===== */
.form-container {
    max-width: 400px;
    margin: 40px auto;
    padding: 40px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.form-container h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
    font-size: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-size: 14px;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    background-color: #fafafa;
    transition: border-color 0.2s, background-color 0.2s;
    box-sizing: border-box;
}

.form-group input:focus {
    outline: none;
    border-color: #666;
    background-color: #ffffff;
}

.submit-button {
    width: 100%;
    padding: 12px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-bottom: 0px;
}

.submit-button:hover {
    background-color: #555;
}

#auth-status {
    margin: 16px 0;
    padding: 12px;
    border-radius: 6px;
    text-align: center;
    font-size: 14px;
}

.inline-link { 
    text-decoration: none; 
    padding-top: 10px;
    display: block;
    text-align: center;
    color: #666;
}

.inline-link .only-underline {
    text-decoration: underline;
    text-underline-offset: 0.15em;      /* 少し離して見やすく */
    text-decoration-thickness: 1.5px;   /* お好みで太さ調整 */
    color: #666 !important;
}

.inline-link .only-underline:hover {
    color: #333 !important;
}
</style>
