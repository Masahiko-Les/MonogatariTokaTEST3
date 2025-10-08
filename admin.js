// admin.js - 管理者画面の機能
import { auth, db } from "./firebaseConfig.js";
import { isAdmin } from "./admin_utils.js";
import { checkContentModeration, displayModerationResult } from "./AI_Moderation.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const loadingEl = document.getElementById("loading");
const pendingStoriesEl = document.getElementById("pending-stories");
const noPendingEl = document.getElementById("no-pending-stories");
const loginRequiredEl = document.getElementById("login-required");
const noPermissionEl = document.getElementById("no-permission");

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

// 承認待ちストーリーを取得・表示
async function loadPendingStories() {
  try {
    const q = query(
      collection(db, "stories"),
      where("status", "==", "pending"),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      loadingEl.style.display = "none";
      noPendingEl.style.display = "block";
      return;
    }
    
    pendingStoriesEl.innerHTML = "";
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const nickname = await getNicknameByUid(data.uid);
      const storyCard = createPendingStoryCard(docSnap.id, data, nickname);
      pendingStoriesEl.appendChild(storyCard);
    }
    
    loadingEl.style.display = "none";
    pendingStoriesEl.style.display = "block";
    
  } catch (error) {
    console.error("承認待ちストーリー取得エラー:", error);
    loadingEl.textContent = "エラーが発生しました: " + error.message;
  }
}

// 承認待ちストーリーカードを作成
function createPendingStoryCard(storyId, data, nickname) {
  const card = document.createElement("div");
  card.className = "pending-story";
  card.id = `story-${storyId}`;
  
  const timestamp = data.timestamp?.toDate?.() || new Date();
  const formattedDate = timestamp.toLocaleString("ja-JP");
  
  card.innerHTML = `
    <div class="story-meta">
      <strong>投稿者:</strong> ${nickname} | 
      <strong>ジャンル:</strong> ${data.genre || "未設定"} | 
      <strong>投稿日時:</strong> ${formattedDate}
    </div>
    
    <h3>${data.title || "無題"}</h3>
    
    <div class="story-content">${buildStoryContent(data) || "内容なし"}</div>
    
    <!-- AI判定結果表示エリア -->
    <div id="ai-result-${storyId}" class="ai-result-container" style="display:none;margin:1rem 0;"></div>
    
    <div class="admin-actions">
      <button class="ai-check-btn" onclick="checkStoryWithAI('${storyId}')">
        🤖 AI判定
      </button>
      <button class="approve-btn" onclick="approveStory('${storyId}')">
        ✅ 承認して公開
      </button>
      <button class="reject-btn" onclick="rejectStory('${storyId}')">
        ❌ 却下
      </button>
    </div>
  `;
  
  return card;
}

// ストーリー内容を動的に生成
function buildStoryContent(data) {
  if (data.section1 && data.section2 && data.section3) {
    return `${data.section1}\n\n${data.section2}\n\n${data.section3}`;
  }
  // フォールバック: 古いデータ形式対応
  return data.story || "";
}

// AI判定機能
window.checkStoryWithAI = async function(storyId) {
  const aiResultContainer = document.getElementById(`ai-result-${storyId}`);
  const aiButton = document.querySelector(`button[onclick="checkStoryWithAI('${storyId}')"]`);
  
  if (!aiResultContainer) {
    console.error('AI結果コンテナが見つかりません');
    return;
  }
  
  // ボタンを無効化してローディング表示
  const originalButtonText = aiButton.textContent;
  aiButton.disabled = true;
  aiButton.textContent = "🤖 AI判定中...";
  
  try {
    // Firestoreからストーリーデータを取得
    const storyRef = doc(db, "stories", storyId);
    const storySnap = await getDoc(storyRef);
    
    if (!storySnap.exists()) {
      throw new Error("ストーリーが見つかりません");
    }
    
    const storyData = storySnap.data();
    
    // AI判定実行
    const moderationResult = await checkContentModeration({
      title: storyData.title || "",
      section1: storyData.section1 || "",
      section2: storyData.section2 || "",
      section3: storyData.section3 || ""
    });
    
    // 結果を表示
    aiResultContainer.style.display = "block";
    displayModerationResult(moderationResult, `ai-result-${storyId}`);
    
  } catch (error) {
    console.error('AI判定エラー:', error);
    aiResultContainer.style.display = "block";
    aiResultContainer.innerHTML = `
      <div class="ai-result-error">
        <h4>❌ AI判定エラー</h4>
        <p>AI判定中にエラーが発生しました: ${error.message}</p>
      </div>
    `;
  } finally {
    // ボタンを復元
    aiButton.disabled = false;
    aiButton.textContent = originalButtonText;
  }
};

// ストーリーを承認
window.approveStory = async function(storyId) {
  if (!confirm("このストーリーを承認して公開しますか？")) return;
  
  try {
    const storyRef = doc(db, "stories", storyId);
    await updateDoc(storyRef, {
      status: "published",
      approvedAt: serverTimestamp(),
      approvedBy: auth.currentUser.uid
    });
    
    // UIから削除
    const storyCard = document.getElementById(`story-${storyId}`);
    if (storyCard) {
      storyCard.style.opacity = "0.5";
      storyCard.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #28a745;">
          ✅ 承認しました。ストーリーが公開されました。
        </div>
      `;
      setTimeout(() => {
        storyCard.remove();
        checkIfNoPendingStories();
      }, 2000);
    }
    
  } catch (error) {
    console.error("承認エラー:", error);
    alert("承認に失敗しました: " + error.message);
  }
};

// ストーリーを却下
window.rejectStory = async function(storyId) {
  if (!confirm("このストーリーを却下しますか？（下書きに戻されます）")) return;
  
  try {
    const storyRef = doc(db, "stories", storyId);
    await updateDoc(storyRef, {
      status: "draft",
      rejectedAt: serverTimestamp(),
      rejectedBy: auth.currentUser.uid
    });
    
    // UIから削除
    const storyCard = document.getElementById(`story-${storyId}`);
    if (storyCard) {
      storyCard.style.opacity = "0.5";
      storyCard.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #dc3545;">
          ❌ 却下しました。ストーリーは下書きに戻されました。
        </div>
      `;
      setTimeout(() => {
        storyCard.remove();
        checkIfNoPendingStories();
      }, 2000);
    }
    
  } catch (error) {
    console.error("却下エラー:", error);
    alert("却下に失敗しました: " + error.message);
  }
};

// 承認待ちストーリーがなくなったかチェック
function checkIfNoPendingStories() {
  const remainingStories = document.querySelectorAll(".pending-story");
  if (remainingStories.length === 0) {
    noPendingEl.style.display = "block";
  }
}

// 認証状態の監視
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // 未ログイン
    loadingEl.style.display = "none";
    loginRequiredEl.style.display = "block";
    return;
  }
  
  // 管理者権限チェック
  const adminStatus = await isAdmin(user);
  if (!adminStatus) {
    loadingEl.style.display = "none";
    noPermissionEl.style.display = "block";
    return;
  }
  
  // 管理者の場合、承認待ちストーリーを読み込み
  loadPendingStories();
});