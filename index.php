<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>物語灯花（とうか）</title>
  <link rel="stylesheet" href="style.css">

  <!-- Favicon 基本設定 -->
  <link rel="icon" href="img/favicon/favicon.ico" type="image/x-icon">

  <!-- PNG形式も併用（モダンブラウザ対応） -->
  <link rel="icon" type="image/png" sizes="16x16" href="img/favicon/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="img/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="96x96" href="img/favicon/favicon-96x96.png">

</head>
<body>
  <?php include 'common/header.php'; ?>

  <div class="hero">
    <h1>あなたのストーリーが、誰かの力になる。</h1>
    <p>つらい経験を言葉にして、優しいつながりをつくる場所。</p>
  </div>

  <div class="stories">
    <h2>みんなのストーリー</h2>
    <div class="story-list" id="story-list">読み込み中...</div>
  </div>


  <?php include 'common/footer.php'; ?>
  <script type="module" src="story_load.js"></script>

</body>
</html>