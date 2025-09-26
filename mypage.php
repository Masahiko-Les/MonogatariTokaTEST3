<?php
session_start();
?>
<!doctype html>
<html lang="ja">
<head>
  <title>マイページ | 物語灯花</title>
  <?php include 'common/head.php'; ?>
</head>
<body>

<?php include 'common/header.php'; ?>
<link rel="stylesheet" href="style.css?v=20250916c">

<main class="container">
  <h2>マイページ</h2>

  <!-- 自分のストーリー -->
  <section>
    <h3>自分のストーリー</h3>
    <div id="story-list"></div>
  </section>

<section>
  <h3>お気に入り投稿</h3>
  <p class="subtle">あなたが花束を贈ったストーリー</p>
  <div id="fav-stories"></div>
</section>

</main>

<?php include 'common/footer.php'; ?>
<script type="module" src="mypage.js?v=20250916c"></script>

</body>
</html>
