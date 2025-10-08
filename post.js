// post.js
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase接続チェック関数
function checkFirebaseConnection() {
  try {
    if (!auth || !db) {
      throw new Error("Firebase not initialized");
    }
    return true;
  } catch (error) {
    console.error("Firebase connection error:", error);
    const statusEl = document.getElementById("post-status");
    if (statusEl) {
      statusEl.style.color = "red";
      statusEl.innerHTML = `
        <strong>接続エラー</strong><br>
        Firebase への接続に失敗しました。<br>
        <small>
          • ネットワーク接続を確認してください<br>
          • ページを再読み込みしてください<br>
          • 問題が続く場合は管理者にお問い合わせください
        </small>
      `;
    }
    
    // フォームを無効化
    const form = document.getElementById("story-form");
    if (form) {
      const inputs = form.querySelectorAll('input, textarea, select, button');
      inputs.forEach(input => input.disabled = true);
    }
    
    return false;
  }
}

const MIN = 500; // 各セクションの最小文字数

// 文字数カウンター設定
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

function trim(s) { 
  return (s ?? "").trim(); 
}

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

// 成功モーダルを表示
function showSuccessModal(type) {
  const modalId = 'success-modal';
  
  // 既存のモーダルがあれば削除
  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    existingModal.remove();
  }
  
  let title, message, buttonText;
  
  switch (type) {
    case 'draft':
      title = '下書き保存完了';
      message = '作品が下書きとして保存されました。<br>マイページから続きを編集できます。';
      buttonText = 'マイページへ';
      break;
    case 'pending':
      title = '投稿完了';
      message = '作品を投稿しました。<br>管理者による承認後に公開されます。';
      buttonText = 'トップページへ';
      break;
    case 'published':
      title = '公開完了';
      message = '作品が公開されました。<br>多くの方に読んでもらいましょう！';
      buttonText = 'トップページへ';
      break;
    default:
      title = '投稿完了';
      message = '作品の投稿が完了しました。';
      buttonText = 'トップページへ';
  }
  
  const modalHTML = `
    <div id="${modalId}" class="success-modal show">
      <div class="success-modal-content">
        <div class="success-icon">✅</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="success-actions">
          <button onclick="closeSuccessModal('${type}')" class="success-modal-button">
            ${buttonText}
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 成功モーダルを閉じる
window.closeSuccessModal = function(type) {
  const modal = document.getElementById('success-modal');
  if (modal) {
    modal.remove();
  }
  
  // リダイレクト
  if (type === 'draft') {
    window.location.href = 'mypage.php';
  } else {
    window.location.href = 'index.php';
  }
};

// 物語保存関数
async function saveStory({ status }) {
  const title    = trim(document.getElementById("title")?.value);
  const genre    = document.getElementById("genre")?.value || "";
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

  try {
    // Firestoreに直接保存
    await addDoc(collection(db, "stories"), {
      uid: user.uid,
      title,
      genre,
      section1, section2, section3,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      currentVersion: 1,
      status,
      bouquets: 0,
      bouquetUsers: [],
    });

    // 成功モーダルを表示
    if (status === "draft") {
      showSuccessModal("draft");
    } else if (status === "pending") {
      showSuccessModal("pending");
    } else {
      showSuccessModal("published");
    }

    statusEl.style.color = "green";
    statusEl.textContent = status === "draft" ? "下書きとして保存しました。" : "投稿が完了しました。";

  } catch (err) {
    console.error(err);
    statusEl.style.color = "red";
    statusEl.textContent = "保存に失敗しました。";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Firebase接続チェック
  if (!checkFirebaseConnection()) {
    return; // Firebase接続エラーの場合は処理を停止
  }

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

      const user = auth.currentUser;
      if (!user) { alert("ログインしてください。"); return; }

      // プレビューを表示
      const assembled = `【ジャンル】${genre}\n【タイトル】${title}\n\n` + buildStory(section1, section2, section3);
      previewContent.textContent = assembled;
      previewArea.style.display = "block";
      window.scrollTo({ top: previewArea.offsetTop - 20, behavior: "smooth" });

      statusEl.style.color = "green";
      statusEl.textContent = "内容を確認して投稿してください。";
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
      await saveStory({ status: "pending" });
    });
  }

  // 下書き保存
  if (draftBtn) {
    draftBtn.addEventListener("click", async () => {
      await saveStory({ status: "draft" });
    });
  }
});