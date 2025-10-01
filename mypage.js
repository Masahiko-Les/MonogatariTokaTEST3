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
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
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
  
  // ステータス表示を詳細化
  let status, statusClass;
  switch(data.status) {
    case "published":
      status = "公開済み";
      statusClass = "published";
      break;
    case "pending":
      status = "承認待ち";
      statusClass = "pending";
      break;
    case "draft":
    default:
      status = "下書き";
      statusClass = "draft";
      break;
  }
  
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
        <span class="status-badge ${statusClass}">${status}</span>
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

// お気に入りストーリー（花を贈ったストーリー）を表示
async function renderFavoriteStories() {
  const user = auth.currentUser;
  if (!user) return;

  const favStoriesEl = document.getElementById("fav-stories");
  if (!favStoriesEl) {
    console.warn("#fav-stories が見つかりません");
    return;
  }
  favStoriesEl.innerHTML = "<p style='text-align: center; color: #666;'>読み込み中...</p>";

  try {
    // 自分が花を贈ったストーリーを取得（bouquetUsersに自分のUIDが含まれている）
    const q = query(
      collection(db, "stories"),
      where("bouquetUsers", "array-contains", user.uid),
      where("status", "==", "published"), // 公開済みのもののみ
      orderBy("timestamp", "desc")
    );

    const qs = await getDocs(q);
    
    if (qs.empty) {
      favStoriesEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #666; background: #f8f9fa; border-radius: 8px;">
          <p>まだ花を贈ったストーリーはありません。</p>
          <p><a href="index.php" style="color: #007bff;">ストーリーを読んでみる</a></p>
        </div>
      `;
      return;
    }

    favStoriesEl.innerHTML = "";

    for (const docSnap of qs.docs) {
      const data = docSnap.data();
      const nickname = await getNicknameByUid(data.uid);
      
      // お気に入り用のカードを作成（管理パネルなし）
      const favCard = createFavoriteStoryCard(docSnap, nickname);
      favStoriesEl.appendChild(favCard);
    }

  } catch (error) {
    console.error("お気に入りストーリー取得エラー:", error);
    favStoriesEl.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #d73527;">
        エラーが発生しました: ${error.message}
      </div>
    `;
  }
}

// お気に入りストーリーカードを作成（読み取り専用）
function createFavoriteStoryCard(docSnap, nickname) {
  const data = docSnap.data();
  const storyId = docSnap.id;
  
  // story_card.js の統一カードを使用（お気に入り用）
  const storyCard = createStoryCard(docSnap, {
    nickname: nickname,
    bouquetCount: data.bouquets || 0,
    currentUserUid: auth.currentUser?.uid,
    reacted: true, // お気に入りなので必ず花を贈っている
    isFavorite: true, // お気に入り表示用フラグ
    onBouquet: async (storyId, userId) => {
      // お気に入りページでも花の送信/取り消しを可能にする
      const delta = await toggleBouquet(storyId, userId);
      const countEl = document.getElementById(`bouquet-count-${storyId}`);
      const btnEl = document.querySelector(`.bouquet-btn[data-id="${storyId}"]`);
      if (countEl && btnEl) {
        const current = parseInt(countEl.textContent || "0", 10);
        const newCount = Math.max(0, current + delta);
        countEl.textContent = String(newCount);
        btnEl.textContent = newCount > 0 ? "🌸" : "🌱";
        
        // 花を取り消した場合はお気に入りから削除
        if (delta < 0) {
          storyCard.style.opacity = "0.5";
          storyCard.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
              お気に入りから削除されました
            </div>
          `;
          setTimeout(() => {
            storyCard.remove();
            // お気に入りが空になったかチェック
            const remainingCards = document.querySelectorAll("#fav-stories .story-card");
            if (remainingCards.length === 0) {
              document.getElementById("fav-stories").innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666; background: #f8f9fa; border-radius: 8px;">
                  <p>まだ花を贈ったストーリーはありません。</p>
                  <p><a href="index.php" style="color: #007bff;">ストーリーを読んでみる</a></p>
                </div>
              `;
            }
          }, 1500);
        }
      }
    }
  });

  return storyCard;
}

// 🌸トグル処理（mypage用にコピー）
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

// 認証状態
auth.onAuthStateChanged((user) => {
  if (user) {
    renderMyStories();
    renderFavoriteStories(); // お気に入りも表示
  } else {
    window.location.href = "login.php";
  }
});
