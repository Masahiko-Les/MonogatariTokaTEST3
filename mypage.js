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

// 版数履歴を取得
async function getVersionHistory(storyId) {
  try {
    const versionsRef = collection(db, "stories", storyId, "versions");
    const q = query(versionsRef, orderBy("version", "desc"));
    const snapshot = await getDocs(q);
    
    const versions = [];
    snapshot.forEach(doc => {
      versions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return versions;
  } catch (error) {
    console.error("版数履歴取得エラー:", error);
    return [];
  }
}

// 日時フォーマット関数
function formatDate(date) {
  if (!date) return "不明";
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 過去版のプレビューを表示
async function showVersionPreview(storyId, versionNumber, wrapElement) {
  try {
    const versionRef = doc(db, "stories", storyId, "versions", String(versionNumber));
    const versionSnap = await getDoc(versionRef);
    
    if (!versionSnap.exists()) {
      alert("この版のデータが見つかりません。");
      return;
    }
    
    const versionData = versionSnap.data();
    
    // 既存のストーリーカードを非表示にして、版プレビューを表示
    const storyCard = wrapElement.querySelector('.story-card');
    if (storyCard) {
      storyCard.style.display = 'none';
    }
    
    // 版プレビューを作成
    let versionPreview = wrapElement.querySelector('.version-preview');
    if (!versionPreview) {
      versionPreview = document.createElement('div');
      versionPreview.className = 'version-preview';
      wrapElement.appendChild(versionPreview);
    }
    
    const versionDate = versionData.savedAt?.toDate() || versionData.createdAt?.toDate() || new Date();
    
    versionPreview.innerHTML = `
      <div class="version-card">
        <div class="version-header">
          <h3>📖 版数 ${versionData.version} のプレビュー</h3>
          <p class="version-date">保存日時: ${formatDate(versionDate)}</p>
          <button class="btn close-preview">現在の版に戻る</button>
        </div>
        <div class="version-content">
          <h4>${versionData.title}</h4>
          <div class="version-sections">
            <div class="section">
              <h5>第1章</h5>
              <p>${versionData.section1}</p>
            </div>
            <div class="section">
              <h5>第2章</h5>
              <p>${versionData.section2}</p>
            </div>
            <div class="section">
              <h5>第3章</h5>
              <p>${versionData.section3}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 「現在の版に戻る」ボタンのイベント
    versionPreview.querySelector('.close-preview')?.addEventListener('click', () => {
      versionPreview.style.display = 'none';
      if (storyCard) {
        storyCard.style.display = 'block';
      }
      // プルダウンを現在の版に戻す
      const versionSelect = wrapElement.querySelector('.ver-select');
      if (versionSelect) {
        versionSelect.value = 'current';
      }
    });
    
    versionPreview.style.display = 'block';
    
  } catch (error) {
    console.error("版プレビュー表示エラー:", error);
    alert("版の表示でエラーが発生しました。");
  }
}

// カードUI（管理パネル付き）
async function renderMyStoryCard(docSnap, nickname) {
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

  // 版数履歴を取得
  const versions = await getVersionHistory(storyId);
  
  // 管理パネルを追加
  const wrap = document.createElement("div");
  wrap.className = "my-story-group";
  
  // 版数プルダウンのオプションを生成
  let versionOptions = '';
  
  // 現在の版を追加
  const currentDate = data.updatedAt?.toDate() || data.timestamp?.toDate() || new Date();
  versionOptions += `<option value="current">版数：${data.currentVersion || 1} (${formatDate(currentDate)})</option>`;
  
  // 過去の版を追加
  for (const version of versions) {
    const versionDate = version.savedAt?.toDate() || version.createdAt?.toDate() || new Date();
    versionOptions += `<option value="${version.version}">版数：${version.version} (${formatDate(versionDate)})</option>`;
  }
  
  wrap.innerHTML = `
    <div class="story-admin-panel">
      <div class="admin-card">
        <span class="status-badge ${statusClass}">${status}</span>
        <span class="ver-label">版:</span>
        <select class="ver-select" data-story-id="${storyId}">
          ${versionOptions}
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

  // 版数変更イベント
  wrap.querySelector(".ver-select")?.addEventListener("change", async (e) => {
    const selectedVersion = e.target.value;
    if (selectedVersion === "current") {
      // 現在の版を表示（プレビューを非表示にする）
      const versionPreview = wrap.querySelector('.version-preview');
      if (versionPreview) {
        versionPreview.style.display = 'none';
      }
      if (storyCard) {
        storyCard.style.display = 'block';
      }
      return;
    }
    
    // 過去の版を表示
    await showVersionPreview(storyId, selectedVersion, wrap);
  });

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
    const storyCard = await renderMyStoryCard(docSnap, nickname);
    storyList.appendChild(storyCard);
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
