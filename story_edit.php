<?php
session_start();
$id = $_GET['id'] ?? '';
?>
<!doctype html>
<html lang="ja">
<head>
  <title>物語の編集 | 物語灯花</title>
  <?php include 'common/head.php'; ?>
</head>
<body>
  <?php include_once 'common/header.php'; ?>

  <main style="max-width:900px;margin:2rem auto;padding:0 1rem;">
    <h1>物語を編集</h1>
    <form id="edit-form">
      <input type="hidden" id="story-id" value="<?= htmlspecialchars($id, ENT_QUOTES) ?>">

      <div style="margin-bottom:1rem;">
        <label for="title">タイトル</label>
        <input id="title" type="text" style="width:100%;padding:.6rem;border:1px solid #ddd;border-radius:8px;" required>
      </div>

      <div style="margin-bottom:1rem;">
        <label for="section1">① 苦しみに直面した経験</label>
        <textarea id="section1" rows="6" style="width:100%;padding:.6rem;border:1px solid #ddd;border-radius:8px;"></textarea>
      </div>

      <div style="margin-bottom:1rem;">
        <label for="section2">② どう向き合ったか</label>
        <textarea id="section2" rows="6" style="width:100%;padding:.6rem;border:1px solid #ddd;border-radius:8px;"></textarea>
      </div>

      <div style="margin-bottom:1rem;">
        <label for="section3">③ どう乗り越えたか</label>
        <textarea id="section3" rows="6" style="width:100%;padding:.6rem;border:1px solid #ddd;border-radius:8px;"></textarea>
      </div>

      <div style="margin-bottom:1rem;">
        <label for="status">ステータス</label>
        <select id="status">
          <option value="published">公開</option>
          <option value="draft">下書き</option>
        </select>
      </div>

      <button type="submit" style="padding:.7rem 1.2rem;border:1px solid #ccc;border-radius:8px;background:#f7f7f7;cursor:pointer;">更新する</button>
      <button type="button" id="delete-btn" style="margin-left:1rem;padding:.7rem 1.2rem;border:1px solid #c00;border-radius:8px;background:#fff;color:#c00;cursor:pointer;">削除する</button>
      <div id="update-status" style="margin-top:1rem;color:#b00;"></div>
    </form>
  </main>

  <script type="module">
    import { auth, db } from "./auth.js";
    import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
    import { doc, getDoc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

    const storyId = document.getElementById("story-id").value;
    const form = document.getElementById("edit-form");
    const statusEl = document.getElementById("update-status");
    const deleteBtn = document.getElementById("delete-btn");

    async function loadStory() {
      if (!storyId) {
        statusEl.textContent = "ストーリーIDが指定されていません。";
        return;
      }
      const snap = await getDoc(doc(db, "stories", storyId));
      if (!snap.exists()) {
        statusEl.textContent = "ストーリーが見つかりません。";
        return;
      }
      const data = snap.data();
      document.getElementById("title").value = data.title || "";
      document.getElementById("section1").value = data.section1 || "";
      document.getElementById("section2").value = data.section2 || "";
      document.getElementById("section3").value = data.section3 || "";
      document.getElementById("status").value = data.status || "published";
    }

    async function saveStory(e) {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) {
        alert("ログインしてください");
        return;
      }
      
      statusEl.style.color = "blue";
      statusEl.textContent = "更新中...";
      
      try {
        console.log("現在のユーザー:", user.uid);
        
        const storyRef = doc(db, "stories", storyId);
        const snap = await getDoc(storyRef);
        
        if (!snap.exists()) {
          throw new Error("ストーリーが見つかりません");
        }
        
        const currentData = snap.data();
        console.log("現在のデータ:", currentData);
        
        // ユーザー権限チェック
        if (currentData.uid !== user.uid) {
          throw new Error("編集権限がありません");
        }
        
        const currentVersion = currentData.currentVersion || 1;
        const newVersion = currentVersion + 1;
        
        console.log("版数保存開始:", currentVersion);
        
        // 一時的にサブコレクション保存をスキップしてテスト
        try {
          const versionRef = doc(db, "stories", storyId, "versions", String(currentVersion));
          await setDoc(versionRef, {
            version: currentVersion,
            title: currentData.title,
            section1: currentData.section1,
            section2: currentData.section2,
            section3: currentData.section3,
            status: currentData.status,
            savedAt: currentData.updatedAt || currentData.timestamp || serverTimestamp(),
            createdAt: serverTimestamp()
          });
          console.log("版数保存完了");
        } catch (versionError) {
          console.warn("版数保存でエラー（スキップして続行）:", versionError);
          // 版数保存に失敗してもメイン更新は続行
        }
        
        console.log("版数保存完了, メイン更新開始");
        
        // メインストーリーを新しい版で更新
        await updateDoc(storyRef, {
          title: document.getElementById("title").value.trim(),
          section1: document.getElementById("section1").value.trim(),
          section2: document.getElementById("section2").value.trim(),
          section3: document.getElementById("section3").value.trim(),
          status: document.getElementById("status").value,
          updatedAt: serverTimestamp(),
          currentVersion: newVersion
        });
        
        console.log("更新完了");
        statusEl.style.color = "green";
        statusEl.textContent = `更新しました。版数: ${newVersion}`;
      } catch (err) {
        console.error("詳細エラー:", err);
        statusEl.style.color = "red";
        statusEl.textContent = `更新に失敗しました: ${err.message}`;
      }
    }

    async function deleteStory() {
      if (!confirm("本当にこのストーリーを削除しますか？")) return;
      try {
        await deleteDoc(doc(db, "stories", storyId));
        alert("削除しました。");
        window.location.href = "mypage.php";
      } catch (err) {
        console.error(err);
        alert("削除に失敗しました。");
      }
    }

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert("ログインしてください");
        window.location.href = "login.php";
        return;
      }
      loadStory();
    });

    form.addEventListener("submit", saveStory);
    deleteBtn.addEventListener("click", deleteStory);
  </script>
</body>
</html>
