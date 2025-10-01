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

  // URLパラメータからカテゴリーを取得
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');

  let q;
  if (category) {
    // カテゴリーが指定されている場合はフィルタリング
    q = query(
      collection(db, "stories"),
      where("status", "==", "published"),
      where("genre", "==", category),
      orderBy("timestamp", "desc")
    );
  } else {
    // カテゴリーが指定されていない場合は全て表示
    q = query(
      collection(db, "stories"),
      where("status", "==", "published"),
      orderBy("timestamp", "desc")
    );
  }

  const qs = await getDocs(q);

  if (qs.empty) {
    storyList.innerHTML = `<p style="text-align: center; color: #666; padding: 2rem;">
      ${category ? `「${category}」のストーリーはまだありません。` : 'ストーリーがまだありません。'}
    </p>`;
    return;
  }

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
        
        // 花を贈った場合（delta > 0）にモーダルを表示
        if (delta > 0) {
          showThankYouModal(nickname);
        }
      }
    });

    storyList.appendChild(card);
  }
}

onAuthStateChanged(auth, (user) => {
  renderStories(user);
});

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

// HTMLエスケープ関数
function escapeHTML(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
