// post.js
import { auth, db } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const MIN = 500;// 各セクションの最小文字数
  [
    { id: "section1", counter: "section1-counter" },
    { id: "section2", counter: "section2-counter" },
    { id: "section3", counter: "section3-counter" }
  ].forEach(({ id, counter }) => {
    const textarea = document.getElementById(id);
    const counterDiv = document.getElementById(counter);
    if (textarea && counterDiv) {
      const updateCounter = () => {
        const len = textarea.value.trim().length;
        if (len < MIN) {
          counterDiv.textContent = `あと${MIN - len}文字必要です`;
          counterDiv.style.color = "#b00";
        } else {
          counterDiv.textContent = `入力済み：${len}文字`;
          counterDiv.style.color = "#228b22";
        }
      };
      textarea.addEventListener("input", updateCounter);
      updateCounter(); // 初期表示
    }
  });
function trim(s){ return (s ?? "").trim(); }
function validateSections(s1, s2, s3) {
  const errors = [];
  if (trim(s1).length < MIN) errors.push(`① は ${MIN}文字以上で入力してください（現在${trim(s1).length}文字）`);
  if (trim(s2).length < MIN) errors.push(`② は ${MIN}文字以上で入力してください（現在${trim(s2).length}文字）`);
  if (trim(s3).length < MIN) errors.push(`③ は ${MIN}文字以上で入力してください（現在${trim(s3).length}文字）`);
  return errors;
}

function buildStory(s1, s2, s3) {
  return `${trim(s1)}\n\n` +
         `${trim(s2)}\n\n` +
         `${trim(s3)}`;
}

function buildSummary(s1, s2, s3, maxLen = 200) {
  const joined = `${trim(s1)} ${trim(s2)} ${trim(s3)}`;
  return joined.slice(0, maxLen);
}

// 成功モーダルを表示する関数
function showSuccessModal() {
  console.log("showSuccessModal called"); // デバッグ用
  
  // 既存のモーダルを削除（重複防止）
  const existingModal = document.getElementById("success-modal");
  if (existingModal) {
    existingModal.remove();
  }
  
  // モーダルHTMLを動的に作成
  const modalHTML = `
    <div id="success-modal" class="success-modal show">
      <div class="success-modal-content">
        <div class="success-icon">✅</div>
        <h3>公開しました！</h3>
        <p>あなたのストーリーが正常に公開されました。<br>トップページでご確認いただけます。</p>
        <button id="success-modal-button" class="success-modal-button">
          トップページへ
        </button>
      </div>
    </div>
  `;
  
  // bodyに追加
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // イベントリスナーを設定
  const modal = document.getElementById("success-modal");
  const button = document.getElementById("success-modal-button");
  
  if (button) {
    button.addEventListener("click", () => {
      window.location.href = "index.php";
    });
  }
  
  // モーダル背景クリックで閉じる
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        window.location.href = "index.php";
      }
    });
  }
  
  console.log("Modal created and displayed"); // デバッグ用
}

async function saveStory({status}) {
  const genre    = document.getElementById("genre")?.value || "";
  const title    = trim(document.getElementById("title")?.value);
  const section1 = trim(document.getElementById("section1")?.value);
  const section2 = trim(document.getElementById("section2")?.value);
  const section3 = trim(document.getElementById("section3")?.value);
  const statusEl = document.getElementById("post-status");

  if (!genre) { statusEl.textContent = "ジャンルを選択してください。"; return; }
  if (!title) { statusEl.textContent = "タイトルを入力してください。"; return; }

  const errs = validateSections(section1, section2, section3);
  if (errs.length) { statusEl.textContent = errs.join(" / "); return; }

  const user = auth.currentUser;
  if (!user) { alert("ログインしてください。"); return; }

  const story   = buildStory(section1, section2, section3);
  const summary = buildSummary(section1, section2, section3);

  try {
    await addDoc(collection(db, "stories"), {
      // 既存の一覧互換用フィールド
      uid: user.uid,
      title,
      summary,
      story,

      // 新仕様
      genre,                // ← プルダウンのジャンル
      section1, section2, section3,

      // タイムスタンプ＆版管理
      timestamp: serverTimestamp(),   // 旧並び替え互換
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      currentVersion: 1,

      // 公開/下書き
      status,                          // "published" or "draft"

      // 共感（初期値）
      bouquets: 0,
      bouquetUsers: [],
    });

    if (status === "draft") {
      statusEl.style.color = "green";
      statusEl.textContent = "下書きを保存しました。";
    } else {
      // モーダルを表示
      showSuccessModal();
    }
  } catch (err) {
    console.error(err);
    statusEl.style.color = "red";
    statusEl.textContent = "保存に失敗しました。";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form          = document.getElementById("story-form");
  const previewArea   = document.getElementById("preview-area");
  const previewBtn    = document.getElementById("preview-btn");
  const draftBtn      = document.getElementById("save-draft-btn");
  const publishBtn    = document.getElementById("publish-btn");
  const backEditBtn   = document.getElementById("back-edit-btn");
  const statusEl      = document.getElementById("post-status");
  const previewContent= document.getElementById("preview-content");

  if (!form) return;

  // 認証状態に応じてフォーム表示
  onAuthStateChanged(auth, (user) => {
    const loginModal = document.getElementById("login-required-modal");
    
    if (user) {
      // ログイン済み：フォームを表示、モーダルを非表示
      form.style.display = "block";
      if (loginModal) loginModal.style.display = "none";
    } else {
      // 未ログイン：フォームを非表示、モーダルを表示
      form.style.display = "none";
      if (loginModal) loginModal.style.display = "flex";
    }
  });

  // モーダルのキャンセルボタン
  const modalCloseBtn = document.getElementById("modal-close-btn");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      window.location.href = "index.php";
    });
  }

  // モーダル背景クリックで閉じる
  const loginModal = document.getElementById("login-required-modal");
  if (loginModal) {
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) {
        window.location.href = "index.php";
      }
    });
  }

  // 確認（プレビューを表示）
  if (previewBtn) {
    previewBtn.addEventListener("click", () => {
      statusEl.textContent = "";

      const title    = trim(document.getElementById("title")?.value);
      const section1 = trim(document.getElementById("section1")?.value);
      const section2 = trim(document.getElementById("section2")?.value);
      const section3 = trim(document.getElementById("section3")?.value);

      const errs = validateSections(section1, section2, section3);
      if (!title) errs.unshift("タイトルを入力してください。");
      if (errs.length) { statusEl.textContent = errs.join(" / "); return; }

      const genre = document.getElementById("genre")?.value || "";
      if (!genre) { statusEl.textContent = "ジャンルを選択してください。"; return; }

      const assembled = `【ジャンル】${genre}\n【タイトル】${title}\n\n` + buildStory(section1, section2, section3);
      previewContent.textContent = assembled;
      previewArea.style.display = "block";
      window.scrollTo({ top: previewArea.offsetTop - 20, behavior: "smooth" });
    });
  }

  // プレビュー → 編集に戻る
  if (backEditBtn) {
    backEditBtn.addEventListener("click", () => {
      previewArea.style.display = "none";
    });
  }

  // プレビュー → 公開する
  if (publishBtn) {
    publishBtn.addEventListener("click", async () => {
      await saveStory({ status: "published" });
    });
  }

  // 下書き保存
  if (draftBtn) {
    draftBtn.addEventListener("click", async () => {
      await saveStory({ status: "draft" });
    });
  }
});
