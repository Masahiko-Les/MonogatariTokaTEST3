// Firebase設定とインスタンスを共通ファイルからインポート
import { app, db, auth } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
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

import { createStoryCard } from "./story_card.js";

const storyList = document.getElementById("story-list");

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

// ストーリー一覧
async function renderStories(currentUser) {
  storyList.innerHTML = "";

  const q = query(
    collection(db, "stories"),
    where("status", "==", "published"),
    orderBy("timestamp", "desc")
  );
  const qs = await getDocs(q);

  for (const docSnap of qs.docs) {
    const data = docSnap.data();
    const nickname = await getNicknameByUid(data.uid);

    const card = createStoryCard(docSnap, {
      nickname,
      bouquetCount: data.bouquets || 0, // 🔑 マイページと同じ数値参照
      currentUserUid: currentUser?.uid,
      reacted: data.bouquetUsers?.includes(currentUser?.uid || ""),
      onBouquet: async (storyId, userId) => {
        const delta = await toggleBouquet(storyId, userId);
        const countEl = document.getElementById(`bouquet-count-${storyId}`);
        const btnEl = document.querySelector(`.bouquet-btn[data-id="${storyId}"]`);
        if (countEl && btnEl) {
          const current = parseInt(countEl.textContent || "0", 10);
          const newCount = Math.max(0, current + delta); // 二重加算を防止
          countEl.textContent = String(newCount);
          btnEl.textContent = newCount > 0 ? "🌸" : "🌱";
        }
      }
    });

    storyList.appendChild(card);
  }
}

onAuthStateChanged(auth, (user) => {
  renderStories(user);
});
