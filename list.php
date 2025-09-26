<!DOCTYPE html>
<html lang="ja">
<head>
  <title>物語一覧 | 物語灯花</title>
  <?php include 'common/head.php'; ?>
</head>
<body>
  <?php include 'common/header.php'; ?>

  <div class="stories">
    <h2>みんなのストーリー</h2>
    <div class="story-list" id="story-list">読み込み中...</div>
  </div>

  <?php include 'common/footer.php'; ?>
  <script type="module" src="story_load.js"></script>

</body>
</html>
