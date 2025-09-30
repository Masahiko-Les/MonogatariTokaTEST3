<!DOCTYPE html>
<html lang="ja">
<head>
  <?php
  $category = isset($_GET['category']) ? htmlspecialchars($_GET['category'], ENT_QUOTES, 'UTF-8') : '';
  $pageTitle = $category ? $category . 'のストーリー | 物語灯花' : '物語一覧 | 物語灯花';
  $listTitle = $category ? $category . 'のストーリー' : 'みんなのストーリー';
  ?>
  <title><?php echo $pageTitle; ?></title>
  <?php include 'common/head.php'; ?>
</head>
<body>
  <?php include 'common/header.php'; ?>

  <div class="stories">
    <h2><?php echo $listTitle; ?></h2>
    <div class="story-list" id="story-list">読み込み中...</div>
  </div>

  <?php include 'common/footer.php'; ?>
  <script type="module" src="story_load.js"></script>

</body>
</html>
