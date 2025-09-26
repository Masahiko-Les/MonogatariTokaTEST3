<?php
// story_detail.php
session_start();
$id = $_GET['id'] ?? '';
?>
<!doctype html>
<html lang="ja">
<head>
  <title>物語詳細 | 物語灯花</title>
  <?php include 'common/head.php'; ?>
</head>
<body>
  <?php include_once 'common/header.php'; ?>

<main style="max-width:900px;margin:2rem auto;padding:0 1rem;">
  <div id="story-detail">読み込み中…</div>

  <!-- 👇 戻るボタン -->
  <div style="margin-top:2rem;text-align:center;">
    <button onclick="history.back()" 
            style="padding:.6rem 1.2rem;border:1px solid #ccc;border-radius:8px;
                   background:#f7f7f7;cursor:pointer;">
      ← 戻る
    </button>
  </div>
</main>


  <script type="module">
    import { db } from "./auth.js";
    import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

    const params = new URLSearchParams(window.location.search);
    const storyId = params.get("id");
    const container = document.getElementById("story-detail");

    async function loadStory() {
      if (!storyId) {
        container.textContent = "ストーリーが見つかりません。";
        return;
      }
      const snap = await getDoc(doc(db, "stories", storyId));
      if (!snap.exists()) {
        container.textContent = "ストーリーが存在しません。";
        return;
      }
      const data = snap.data();

      container.innerHTML = `
        <h2>${data.title}</h2>
        <p>${data.section1.replace(/\n/g,"<br>")}</p>
        <p>${data.section2.replace(/\n/g,"<br>")}</p>
        <p>${data.section3.replace(/\n/g,"<br>")}</p>
      `;
    }

    loadStory();
  </script>
</body>
</html>
