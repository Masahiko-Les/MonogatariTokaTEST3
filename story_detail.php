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

<style>
.story-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.story-header h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.8rem;
  line-height: 1.4;
}

.story-meta {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
  text-align: right;
}

.story-content {
  margin-bottom: 2rem;
}

.story-section {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.story-section p {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.story-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #fafafa;
  border-radius: 8px;
  margin-top: 2rem;
}

.bouquet-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  transition: transform 0.2s;
}

.bouquet-btn:hover {
  transform: scale(1.1);
}

.bouquet-icon {
  font-size: 1.5rem;
}

.bouquet-text {
  color: #666;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

.bouquet-text.clickable {
  cursor: pointer;
  color: #555;
  transition: color 0.2s;
}

.bouquet-text.clickable:hover {
  color: #333;
}

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

/* スマホ対応 */
@media screen and (max-width: 768px) {
  .story-header h2 {
    font-size: 1.5rem;
  }
  
  .story-meta {
    font-size: 0.8rem;
    text-align: left;
  }
  
  .story-footer {
    padding: 0.8rem;
  }
}
</style>


  <script type="module">
    import { auth, db } from "./auth.js";
    import { 
      doc, 
      getDoc, 
      updateDoc, 
      arrayUnion, 
      arrayRemove, 
      increment
    } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
    import {
      onAuthStateChanged
    } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

    const params = new URLSearchParams(window.location.search);
    const storyId = params.get("id");
    const container = document.getElementById("story-detail");
    let currentUser = null;
    let authorNickname = ""; // 投稿者のニックネームを保存

    // 認証状態の監視
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      loadStory(); // ユーザー状態が変わったら再読み込み
    });

    // 🌸トグル処理
    async function toggleBouquet(storyId, userId) {
      const ref = doc(db, "stories", storyId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return 0;

      const data = snap.data();
      const reacted = (data.bouquetUsers || []).includes(userId);

      if (reacted) {
        await updateDoc(ref, {
          bouquetUsers: arrayRemove(userId),
          bouquets: increment(-1)
        });
        return -1;
      } else {
        await updateDoc(ref, {
          bouquetUsers: arrayUnion(userId),
          bouquets: increment(1)
        });
        return +1;
      }
    }

    // ニックネーム取得
    async function getNicknameByUid(uid) {
      if (!uid) return "ゲスト";
      try {
        const uref = doc(db, "users", uid);
        const usnap = await getDoc(uref);
        return usnap.exists() ? (usnap.data().nickname || "ゲスト") : "ゲスト";
      } catch (e) {
        console.error("nickname取得エラー:", e);
        return "ゲスト";
      }
    }

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

      // 投稿者のニックネームを取得
      const nickname = await getNicknameByUid(data.uid);
      authorNickname = nickname; // グローバル変数に保存

      // 日時フォーマット
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        return `${year}/${month}/${day} ${hour}:${minute.toString().padStart(2, '0')}`;
      };

      let created = new Date();
      try {
        if (data.timestamp?.toDate) created = data.timestamp.toDate();
        else if (typeof data.timestamp === "number") created = new Date(data.timestamp);
      } catch (_) {}

      // 花の状態
      const bouquetCount = data.bouquets || 0;
      const reacted = currentUser && (data.bouquetUsers || []).includes(currentUser.uid);
      const icon = bouquetCount > 0 ? "🌸" : "🌱";

      container.innerHTML = `
        <div class="story-header">
          <h2>${escapeHTML(data.title)}</h2>
          <p class="story-meta">
            投稿者：${escapeHTML(nickname)} | 
            カテゴリー：${escapeHTML(data.genre || "未分類")} | 
            ${formatDate(created)}
          </p>
        </div>
        
        <div class="story-content">
          <div class="story-section">
            <p>${escapeHTML(data.section1 || "").replace(/\r?\n/g, "<br>")}</p>
          </div>
          <div class="story-section">
            <p>${escapeHTML(data.section2 || "").replace(/\r?\n/g, "<br>")}</p>
          </div>
          <div class="story-section">
            <p>${escapeHTML(data.section3 || "").replace(/\r?\n/g, "<br>")}</p>
          </div>
        </div>

        <div class="story-footer">
          ${currentUser 
            ? `<button class="bouquet-btn" data-id="${storyId}" aria-label="bouquet">
                 ${reacted ? "🌸" : icon}
               </button>
               <span id="bouquet-count-${storyId}">${bouquetCount}</span>
               <span class="bouquet-text clickable" data-id="${storyId}">この物語に花を贈る</span>`
            : `<span class="bouquet-icon">${icon}</span>
               <span id="bouquet-count-${storyId}">${bouquetCount}</span>
               <span class="bouquet-text">ログインして花を贈ろう</span>`
          }
        </div>
      `;

      // 花ボタンのイベントリスナー
      if (currentUser) {
        const bouquetBtn = container.querySelector(".bouquet-btn");
        const bouquetText = container.querySelector(".bouquet-text.clickable");
        
        const handleBouquetClick = async () => {
          try {
            const delta = await toggleBouquet(storyId, currentUser.uid);
            const countEl = document.getElementById(`bouquet-count-${storyId}`);
            const btnEl = container.querySelector(".bouquet-btn");

            if (countEl) {
              countEl.textContent = parseInt(countEl.textContent) + delta;
            }

            if (btnEl) {
              const newCount = parseInt(countEl.textContent);
              const newIcon = newCount > 0 ? "🌸" : "🌱";
              btnEl.textContent = delta > 0 ? "🌸" : newIcon;
            }

            // 花を贈った場合（delta > 0）にモーダルを表示
            if (delta > 0) {
              showThankYouModal(authorNickname);
            }
          } catch (error) {
            console.error("花を贈る際にエラーが発生しました:", error);
            alert("花を贈る際にエラーが発生しました");
          }
        };

        // 花ボタンとテキストの両方にイベントリスナーを追加
        bouquetBtn?.addEventListener("click", handleBouquetClick);
        bouquetText?.addEventListener("click", handleBouquetClick);
      }
    }

    function escapeHTML(str) {
      return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    // モーダル表示関数
    function showThankYouModal(authorName) {
      // モーダルHTMLを作成
      const modalHTML = `
        <div class="modal-overlay" id="thankYouModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>🌸 花を贈りました</h3>
            </div>
            <div class="modal-body">
              <p>花を贈ってくれてありがとう。</p>
              <p>自分の苦しみの物語を書いてくれた<strong>${escapeHTML(authorName)}</strong>さんもきっと喜んでくれます。</p>
            </div>
            <div class="modal-footer">
              <button class="modal-close-btn" onclick="closeThankYouModal()">閉じる</button>
            </div>
          </div>
        </div>
      `;

      // モーダルをbodyに追加
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      // モーダルを表示
      setTimeout(() => {
        document.getElementById('thankYouModal').classList.add('show');
      }, 10);
    }

    // モーダルを閉じる関数
    window.closeThankYouModal = function() {
      const modal = document.getElementById('thankYouModal');
      if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
        }, 300);
      }
    }

    // オーバーレイクリックでモーダルを閉じる
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        closeThankYouModal();
      }
    });

    // Escキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeThankYouModal();
      }
    });
  </script>
</body>
</html>
