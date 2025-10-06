<?php
// post_safari.php - Safari対応版
session_start();
?>
<!doctype html>
<html lang="ja">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>物語を投稿する | 物語灯花</title>
  <?php include 'common/head.php'; ?>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
  <?php include_once 'common/header.php'; ?>

  <main style="max-width:900px;margin:2rem auto 4rem;padding:0 1rem;">
    <h1 style="font-size:1.8rem;margin:0 0 1rem;">ストーリーを投稿する（Safari版）</h1>

    <!-- ログイン必須モーダル -->
    <div id="login-required-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center;">
      <div style="border:1px solid #e0e0e0;border-radius:12px;padding:2.5rem;background:#ffffff;box-shadow:0 8px 24px rgba(0,0,0,0.15);text-align:center;max-width:400px;margin:1rem;position:relative;">
        <div style="font-size:1.3rem;margin-bottom:1.5rem;color:#333;font-weight:600;">投稿するにはログインしてください</div>
        <a href="login.php" style="display:inline-block;padding:0.8rem 2rem;background:#444;color:white;text-decoration:none;border-radius:8px;transition:background 0.2s;font-weight:500;margin-bottom:1rem;">
          ログインはこちらから
        </a>
        <div style="margin-top:1rem;">
          <button id="modal-close-btn" style="background:none;border:1px solid #ddd;padding:0.6rem 1.5rem;border-radius:6px;color:#666;cursor:pointer;transition:all 0.2s;">
            キャンセル
          </button>
        </div>
      </div>
    </div>

    <!-- 注意事項 -->
    <section style="border:1px solid #f3c6c6;background:#fff7f7;border-radius:10px;padding:1rem 1rem 0.7rem;margin-bottom:1.25rem;">
      <h2 style="font-size:1.05rem;margin:.1rem 0 .6rem;color:#a33;">注意事項（必読）</h2>
      <p style="margin:0 0 .5rem;color:#555;line-height:1.9;">
        安心安全な場をつくるために以下をご確認の上、投稿してください。
      </p>
      <ul style="margin:.25rem 0 .8rem;padding-left:1.2rem;line-height:1.9;color:#444;">
        <li>人のために投稿する場です。読んだ人を傷つける言葉はNGです。</li>
        <li>個人が特定されないよう、個人情報の記載にご注意ください。</li>
        <li>過去の振り返りは心理的負荷になる場合があります。決して無理をせず、ご自身の体調に配慮してください。</li>
        <li>管理者が内容を確認した上での公開となります。</li>
      </ul>
    </section>

    <form id="story-form" style="display:none;">
      <!-- ジャンル -->
      <div style="margin-bottom:1rem;">
        <label for="genre" style="display:block;margin-bottom:.4rem;">ジャンル</label>
        <select id="genre" required
                style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:10px;">
          <option value="" selected>選択してください</option>
          <option value="うつ">うつ</option>
          <option value="吃音">吃音</option>
          <option value="いじめ">いじめ</option>
          <option value="障害児の子育て">障害児の子育て</option>
        </select>
      </div>

      <!-- タイトル -->
      <div style="margin-bottom:1rem;">
        <label for="title" style="display:block;margin-bottom:.4rem;">タイトル</label>
        <input id="title" type="text" placeholder="例）暗闇の中で見つけた灯り"
               style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:10px;" required>
      </div>

      <!-- セクション 1 -->
      <div style="margin-bottom:1rem;">
        <label for="section1" style="display:block;margin-bottom:.4rem;">
          ① どのような苦しみに直面しましたか？（500文字以上）
        </label>
        <textarea id="section1" rows="7" placeholder="背景や感情など、丁寧に具体的に書いてください。"
                  style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:10px;"></textarea>
        <div id="section1-counter" style="font-size:0.95em;color:#888;margin-top:0.2em;text-align:right;"></div>
      </div>

      <!-- セクション 2 -->
      <div style="margin-bottom:1rem;">
        <label for="section2" style="display:block;margin-bottom:.4rem;">
          ② その苦しみにどう向き合いましたか？（500文字以上）
        </label>
        <textarea id="section2" rows="7" placeholder="人に伝わるよう、具体的に書いてください。"
                  style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:10px;"></textarea>
        <div id="section2-counter" style="font-size:0.95em;color:#888;margin-top:0.2em;text-align:right;"></div>
      </div>

      <!-- セクション 3 -->
      <div style="margin-bottom:1rem;">
        <label for="section3" style="display:block;margin-bottom:.4rem;">
          ③ その苦しみをどう乗り越えましたか？（500文字以上）
        </label>
        <textarea id="section3" rows="7" placeholder="回復の道のり、気づき、支えになったものなど。"
                  style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:10px;"></textarea>
        <div id="section3-counter" style="font-size:0.95em;color:#888;margin-top:0.2em;text-align:right;"></div>
      </div>

      <!-- ボタン -->
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem;">
        <button id="preview-btn" type="button"
                style="padding:.7rem 1.2rem;border:1px solid #dcdcdc;border-radius:10px;background:#fff;cursor:pointer;">
          確認
        </button>
        <button id="save-draft-btn" type="button"
                style="padding:.7rem 1.2rem;border:1px solid #dcdcdc;border-radius:10px;background:#fff;cursor:pointer;">
          下書き保存
        </button>
      </div>

      <div id="post-status" style="margin-top:.9rem;color:#b00;"></div>
    </form>

    <!-- プレビュー -->
    <section id="preview-area" style="display:none;margin-top:1.25rem;background:#fff;border:1px solid #eee;border-radius:12px;box-shadow:0 6px 16px rgba(0,0,0,.05);padding:1.1rem;">
      <h2 style="font-size:1.2rem;margin:.2rem 0 .6rem;">プレビュー</h2>
      <div id="preview-content" style="white-space:pre-wrap;line-height:1.9;color:#333;"></div>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem;">
        <button id="publish-btn" type="button"
                style="padding:.7rem 1.2rem;border:1px solid #dcdcdc;border-radius:10px;background:#fff;cursor:pointer;">
          公開する
        </button>
        <button id="back-edit-btn" type="button"
                style="padding:.7rem 1.2rem;border:1px solid #dcdcdc;border-radius:10px;background:#fff;cursor:pointer;">
          編集に戻る
        </button>
      </div>
    </section>
  </main>

  <!-- 成功モーダル -->
  <div id="success-modal" class="success-modal">
    <div class="success-modal-content">
      <div class="success-icon">✅</div>
      <h3>公開しました！</h3>
      <p>あなたのストーリーが正常に公開されました。<br>トップページでご確認いただけます。</p>
      <button id="success-modal-button" class="success-modal-button">
        トップページへ
      </button>
    </div>
  </div>

  <!-- Firebase Compat SDK - Safari対応 -->
  <script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-compat-auth.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-compat-firestore.js"></script>
  <script src="firebaseConfig_safari.js?v=<?php echo time(); ?>"></script>
  <script src="post_safari.js?v=<?php echo time(); ?>"></script>

  <style>
  /* モデレーション警告モーダル */
  .moderation-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .moderation-modal.show {
    opacity: 1;
    visibility: visible;
  }

  .moderation-modal-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transform: scale(0.8);
    transition: transform 0.3s ease;
    text-align: center;
  }

  .moderation-modal.show .moderation-modal-content {
    transform: scale(1);
  }

  .warning-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .moderation-modal h3 {
    margin: 0 0 1rem 0;
    color: #e74c3c;
    font-size: 1.4rem;
  }

  .moderation-modal p {
    margin: 0 0 1rem 0;
    line-height: 1.6;
    color: #555;
    text-align: left;
  }

  .moderation-modal ul {
    text-align: left;
    margin: 1rem 0;
    padding-left: 1.5rem;
    color: #666;
  }

  .moderation-modal li {
    margin-bottom: 0.5rem;
  }

  .moderation-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }

  .edit-button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }

  .edit-button:hover {
    background-color: #2980b9;
  }

  /* 成功モーダル */
  .success-modal {
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

  .success-modal.show {
    opacity: 1;
    visibility: visible;
  }

  .success-modal-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transform: scale(0.8);
    transition: transform 0.3s ease;
  }

  .success-modal.show .success-modal-content {
    transform: scale(1);
  }

  .success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .success-modal h3 {
    margin: 0 0 1rem 0;
    color: #27ae60;
    font-size: 1.3rem;
  }

  .success-modal p {
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
    color: #555;
  }

  .success-modal-button {
    background-color: #333;
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }

  .success-modal-button:hover {
    background-color: #555;
  }

  /* Safari版表示 */
  h1::after {
    content: " 🍎";
    font-size: 0.8em;
    opacity: 0.6;
  }

  /* フラグ情報（Safari対応版であることを示す） */
  .flagged-sections {
    margin: 1rem 0;
    border-left: 3px solid #f39c12;
    padding-left: 1rem;
    background: #fef9e7;
    border-radius: 4px;
  }

  .flagged-chunk {
    margin-bottom: 1rem;
    padding: 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: white;
  }

  .section-title {
    font-weight: bold;
    color: #e74c3c;
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }

  .flagged-text {
    background: #f8f9fa;
    padding: 0.5rem;
    border-radius: 4px;
    font-style: italic;
    color: #333;
    margin: 0.5rem 0;
  }

  .violation-categories {
    color: #666;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
  </style>
</body>
</html>