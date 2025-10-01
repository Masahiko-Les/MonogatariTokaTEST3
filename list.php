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

  <style>
  /* モーダルスタイル */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .modal-overlay.show {
    opacity: 1;
    visibility: visible;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transform: scale(0.8);
    transition: transform 0.3s ease;
  }

  .modal-overlay.show .modal-content {
    transform: scale(1);
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
    text-align: center;
  }

  .modal-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
  }

  .modal-body {
    padding: 1.5rem;
    text-align: center;
  }

  .modal-body p {
    margin: 0 0 1rem 0;
    line-height: 1.6;
    color: #555;
  }

  .modal-body p:last-child {
    margin-bottom: 0;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e0e0e0;
    text-align: center;
  }

  .modal-close-btn {
    background-color: #333;
    color: white;
    border: none;
    padding: 0.7rem 2rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }

  .modal-close-btn:hover {
    background-color: #555;
  }
  </style>

</body>
</html>
