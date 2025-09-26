// mypage.js

// Firebase設定とインスタンスを共通ファイルからインポート
import { app, db, auth } from "./firebaseConfig.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { createStoryCard } from "./story_card.js";

// ニックネーム取得キャッシュ
const nicknameCache = new Map();
async function getNicknameByUid(uid) {
  if (!uid) return "ゲスト";
  if (nicknameCache.has(uid)) return nicknameCache.get(uid);
  try {
    const uref = doc(db, "users", uid);
    const usnap = await getDoc(uref);
    const name = usnap.exists() ? (usnap.data().nickname || "ゲスト") : "ゲスト";
    nicknameCache.set(uid, name);
    return name;
  } catch (e) {
    console.error("nickname取得エラー:", e);
    return "ゲスト";
  }
}

// カードUI（管理パネル付き）
function renderMyStoryCard(docSnap, nickname) {
  const data = docSnap.data();
  const storyId = docSnap.id;
  
  const status = data.status === "published" ? "公開" : "下書き";
  
  // story_card.js の統一カードを使用
  const storyCard = createStoryCard(docSnap, {
    nickname: nickname,
    bouquetCount: data.bouquets || 0,
    isMyPage: true
  });

  // 管理パネルを追加
  const wrap = document.createElement("div");
  wrap.className = "my-story-group";
  wrap.innerHTML = `
    <div class="story-admin-panel">
      <div class="admin-card">
        <span class="status-badge ${status === "公開" ? "published" : "draft"}">${status}</span>
        <span class="ver-label">版:</span>
        <select class="ver-select">
          <option>${data.currentVersion || 1}</option>
        </select>
        <div class="admin-actions">
          <button class="btn edit-btn" data-id="${storyId}">編集</button>
          <button class="btn danger delete-btn" data-id="${storyId}">削除</button>
        </div>
      </div>
    </div>
  `;
  
  // ストーリーカードを追加
  wrap.appendChild(storyCard);

  // 編集
  wrap.querySelector(".edit-btn")?.addEventListener("click", () => {
    window.location.href = `story_edit.php?id=${storyId}`;
  });

  // 削除
  wrap.querySelector(".delete-btn")?.addEventListener("click", async () => {
    if (!confirm("本当に削除しますか？")) return;
    await deleteDoc(doc(db, "stories", storyId));
    wrap.remove();
  });

  return wrap;
}

// 一覧描画
async function renderMyStories() {
  const user = auth.currentUser;
  if (!user) return;

  const storyList = document.getElementById("story-list");
  if (!storyList) {
    console.warn("#story-list が見つかりません");
    return;
  }
  storyList.innerHTML = "";

  const q = query(
    collection(db, "stories"),
    where("uid", "==", user.uid),
    orderBy("timestamp", "desc")
  );

  const qs = await getDocs(q);
  // デバッグしたい場合は下を有効化
  // console.log("uid:", user.uid, "取得件数:", qs.size);

  for (const docSnap of qs.docs) {
    const data = docSnap.data();
    const nickname = await getNicknameByUid(data.uid);
    storyList.appendChild(renderMyStoryCard(docSnap, nickname));
  }
}

// 認証状態
auth.onAuthStateChanged((user) => {
  if (user) {
    renderMyStories();
  } else {
    window.location.href = "login.php";
  }
});
