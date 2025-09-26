<!DOCTYPE html>
<html lang="ja">
<head>
  <title>物語灯花（とうか）</title>
  <?php include 'common/head.php'; ?>

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