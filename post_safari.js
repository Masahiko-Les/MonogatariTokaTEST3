// post_safari.js - iPhone Safari対応版（ES6 Modulesを使わない）

// Firebase Compat SDKを使用（グローバルオブジェクト）
// firebaseConfig_safari.jsで初期化される想定

// Firebase接続チェック関数
function checkFirebaseConnection() {
  try {
    if (!firebase || !firebase.auth || !firebase.firestore) {
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

// グローバル変数
let auth, db;

// Firebase初期化
function initializeFirebase() {
  if (firebase && firebase.auth && firebase.firestore) {
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Firestore設定
    if (db && db.settings) {
      db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
      });
    }
    
    return true;
  }
  return false;
}

const MIN = 500;// 各セクションの最小文字数
// 文字カウンター初期化
function initializeCounters() {
  [
    { id: "section1", counter: "section1-counter" },
    { id: "section2", counter: "section2-counter" },
    { id: "section3", counter: "section3-counter" }
  ].forEach(function(item) {
    const textarea = document.getElementById(item.id);
    const counterDiv = document.getElementById(item.counter);
    if (textarea && counterDiv) {
      const updateCounter = function() {
        const len = textarea.value.trim().length;
        if (len < MIN) {
          counterDiv.textContent = "あと" + (MIN - len) + "文字必要です";
          counterDiv.style.color = "#b00";
        } else {
          counterDiv.textContent = "入力済み：" + len + "文字";
          counterDiv.style.color = "#228b22";
        }
      };
      textarea.addEventListener("input", updateCounter);
      updateCounter(); // 初期表示
    }
  });
}

function trim(s){ return (s || "").trim(); }

function validateSections(s1, s2, s3) {
  const errors = [];
  if (trim(s1).length < MIN) errors.push("① は " + MIN + "文字以上で入力してください（現在" + trim(s1).length + "文字）");
  if (trim(s2).length < MIN) errors.push("② は " + MIN + "文字以上で入力してください（現在" + trim(s2).length + "文字）");
  if (trim(s3).length < MIN) errors.push("③ は " + MIN + "文字以上で入力してください（現在" + trim(s3).length + "文字）");
  return errors;
}

function buildStory(s1, s2, s3) {
  return trim(s1) + "\n\n" +
         trim(s2) + "\n\n" +
         trim(s3);
}

// バックアップ機能（Firestoreのみ）- エラー処理強化版
async function saveBackupToFirestore(storyData, userId) {
  try {
    const backupId = "temp_" + userId + "_" + Date.now();
    
    // Firestoreが利用できるかチェック
    if (!db) {
      console.warn('Firestore not available, skipping backup');
      return null;
    }
    
    await db.collection("drafts_temp").doc(backupId).set({
      title: storyData.title,
      genre: storyData.genre,
      section1: storyData.section1,
      section2: storyData.section2,
      section3: storyData.section3,
      status: "moderating",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: userId,
      backupId: backupId
    });
    
    return backupId;
  } catch (error) {
    console.warn('Failed to backup to Firestore (service will continue):', error);
    // エラーの詳細をログに記録するが、処理は継続
    if (error.code === 'permission-denied') {
      console.warn('Firestore permission denied - check security rules');
    }
    return null;
  }
}

async function removeBackupFromFirestore(backupId) {
  try {
    if (!db || !backupId) {
      console.warn('Firestore not available or no backup ID, skipping removal');
      return;
    }
    
    await db.collection("drafts_temp").doc(backupId).delete();
  } catch (error) {
    console.warn('Failed to remove backup from Firestore (non-critical):', error);
    // バックアップ削除の失敗は処理を止めない
  }
}

// テキストをチャンクに分割する関数
function createTextChunks(storyData) {
  const title = storyData.title;
  const section1 = storyData.section1;
  const section2 = storyData.section2;
  const section3 = storyData.section3;
  const chunks = [];
  
  // タイトルをチャンクに追加
  if (title && title.trim()) {
    chunks.push({
      section: 'タイトル',
      text: title.trim()
    });
  }
  
  // 各セクションを文単位で分割
  const sections = [
    { name: '第1章', text: section1 },
    { name: '第2章', text: section2 },
    { name: '第3章', text: section3 }
  ];
  
  sections.forEach(function(section) {
    if (section.text && section.text.trim()) {
      // 文単位で分割（。や！、？で区切る）
      const sentences = section.text.split(/(?<=[。！？])\s*/)
        .filter(function(sentence) { return sentence.trim().length > 0; })
        .map(function(sentence) { return sentence.trim(); });
      
      if (sentences.length <= 1) {
        // 短い場合はそのまま1つのチャンク
        chunks.push({
          section: section.name,
          text: section.text.trim()
        });
      } else {
        // 長い場合は文単位でチャンク分割
        sentences.forEach(function(sentence, index) {
          if (sentence.trim()) {
            chunks.push({
              section: section.name + " (" + (index + 1) + "文目)",
              text: sentence
            });
          }
        });
      }
    }
  });
  
  return chunks;
}

// モデレーションチェック関数（チャンク対応版）
async function checkContentModeration(storyData) {
  try {
    const chunks = createTextChunks(storyData);
    
    const response = await fetch('moderation_check.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chunks: chunks })
    });
    
    if (!response.ok) {
      throw new Error("HTTP error! status: " + response.status);
    }
    
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('Moderation check failed:', error);
    // エラーの場合は安全側に倒して通す（サービス継続性のため）
    return { safe: true, flagged: false, error: error.message };
  }
}

// モデレーション警告モーダルを表示（チャンク対応版）
function showModerationWarningModal(moderationResult, backupId) {
  // 既存のモーダルを削除
  const existingModal = document.getElementById("moderation-modal");
  if (existingModal) {
    existingModal.remove();
  }
  
  // カテゴリの日本語化
  const categoryTranslations = {
    'hate': 'ヘイトスピーチ',
    'hate/threatening': '脅迫的なヘイトスピーチ',
    'harassment': 'ハラスメント',
    'harassment/threatening': '脅迫的なハラスメント',
    'self-harm': '自傷行為',
    'self-harm/intent': '自傷行為の意図',
    'self-harm/instructions': '自傷行為の指示',
    'sexual': '性的コンテンツ',
    'sexual/minors': '未成年者への性的コンテンツ',
    'violence': '暴力的コンテンツ',
    'violence/graphic': 'グラフィックな暴力'
  };
  
  let contentHTML = '';
  
  // チャンク単位の詳細情報がある場合（両方の命名規則に対応）
  const flaggedChunks = moderationResult.flaggedChunks || moderationResult.flagged_chunks;
  
  if (flaggedChunks && flaggedChunks.length > 0) {
    contentHTML += '<p>以下の箇所に問題が検出されました：</p>';
    contentHTML += '<div class="flagged-sections">';
    
    flaggedChunks.forEach(function(chunk, index) {
      contentHTML += '<div class="flagged-chunk">';
      contentHTML += '<h4 class="section-title">' + chunk.section + '</h4>';
      contentHTML += '<div class="flagged-text">"' + chunk.text + '"</div>';
      
      // categoriesはオブジェクト形式なので適切に処理
      if (chunk.categories && typeof chunk.categories === 'object') {
        const flaggedCategories = [];
        for (const category in chunk.categories) {
          if (chunk.categories[category]) {
            flaggedCategories.push(categoryTranslations[category] || category);
          }
        }
          
        if (flaggedCategories.length > 0) {
          contentHTML += '<div class="violation-categories">';
          contentHTML += '<strong>問題の種類：</strong> ';
          contentHTML += flaggedCategories.join(', ');
          contentHTML += '</div>';
        }
      }
      // flagged_categoriesがある場合（PHPで追加した形式）
      else if (chunk.flagged_categories && Array.isArray(chunk.flagged_categories)) {
        if (chunk.flagged_categories.length > 0) {
          contentHTML += '<div class="violation-categories">';
          contentHTML += '<strong>問題の種類：</strong> ';
          const categoryList = chunk.flagged_categories.map(function(cat) {
            return categoryTranslations[cat] || cat;
          }).join(', ');
          contentHTML += categoryList;
          contentHTML += '</div>';
        }
      }
      
      contentHTML += '</div>';
    });
    
    contentHTML += '</div>';
  } 
  // 従来の形式（categories）の場合
  else if (moderationResult.categories) {
    const categories = moderationResult.categories;
    
    if (typeof categories === 'object') {
      const flaggedCategories = [];
      for (const category in categories) {
        if (categories[category]) {
          flaggedCategories.push(categoryTranslations[category] || category);
        }
      }
        
      if (flaggedCategories.length > 0) {
        contentHTML += '<p>投稿内容に以下のような要素が含まれている可能性があります：</p>';
        contentHTML += '<ul>';
        flaggedCategories.forEach(function(cat) {
          contentHTML += '<li>' + cat + '</li>';
        });
        contentHTML += '</ul>';
      }
    }
  }
  // 完全にフォールバック
  else {
    contentHTML += '<p>投稿内容に不適切な要素が含まれている可能性があります。</p>';
  }
  
  const modalHTML = `
    <div id="moderation-modal" class="moderation-modal show">
      <div class="moderation-modal-content">
        <div class="warning-icon">⚠️</div>
        <h3>投稿内容について</h3>
        ${contentHTML}
        <p class="moderation-advice">内容を見直して、より適切な表現に修正していただけますでしょうか。</p>
        <div class="moderation-buttons">
          <button id="edit-content-btn" class="edit-button">内容を修正する</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // イベントリスナー設定
  const editBtn = document.getElementById("edit-content-btn");
  
  if (editBtn) {
    editBtn.addEventListener("click", function() {
      document.getElementById("moderation-modal").remove();
      // フォームに戻る（何もしない）
    });
  }
}

// 成功モーダルを表示する関数
function showSuccessModal(type) {
  type = type || "pending";
  // 既存のモーダルを削除（重複防止）
  const existingModal = document.getElementById("success-modal");
  if (existingModal) {
    existingModal.remove();
  }
  
  // メッセージをタイプに応じて変更
  let title, message, buttonText;
  if (type === "pending") {
    title = "投稿しました！";
    message = "あなたのストーリーを受け付けました。<br>管理者による確認後、サイトに公開されます。";
    buttonText = "マイページへ";
  } else if (type === "draft") {
    title = "下書き保存しました！";
    message = "あなたのストーリーを下書きとして保存しました。<br>マイページで確認・編集できます。";
    buttonText = "マイページへ";
  } else {
    title = "公開しました！";
    message = "あなたのストーリーが正常に公開されました。<br>トップページでご確認いただけます。";
    buttonText = "トップページへ";
  }
  
  // モーダルHTMLを動的に作成
  const modalHTML = `
    <div id="success-modal" class="success-modal show">
      <div class="success-modal-content">
        <div class="success-icon">✅</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <button id="success-modal-button" class="success-modal-button">
          ${buttonText}
        </button>
      </div>
    </div>
  `;
  
  // bodyに追加
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // イベントリスナーを設定
  const modal = document.getElementById("success-modal");
  const button = document.getElementById("success-modal-button");
  
  // 遷移先を決定
  const redirectUrl = (type === "draft" || type === "pending") ? "mypage.php" : "index.php";
  
  if (button) {
    button.addEventListener("click", function() {
      window.location.href = redirectUrl;
    });
  }
  
  // モーダル背景クリックで閉じる
  if (modal) {
    modal.addEventListener("click", function(e) {
      if (e.target === modal) {
        window.location.href = redirectUrl;
      }
    });
  }
  
  console.log("Modal created and displayed"); // デバッグ用
}

async function saveStory(options) {
  // Firebase接続チェック
  if (!checkFirebaseConnection()) {
    return;
  }

  const genre    = document.getElementById("genre") ? document.getElementById("genre").value : "";
  const title    = trim(document.getElementById("title") ? document.getElementById("title").value : "");
  const section1 = trim(document.getElementById("section1") ? document.getElementById("section1").value : "");
  const section2 = trim(document.getElementById("section2") ? document.getElementById("section2").value : "");
  const section3 = trim(document.getElementById("section3") ? document.getElementById("section3").value : "");
  const statusEl = document.getElementById("post-status");
  const status = options.status;

  if (!genre) { statusEl.textContent = "ジャンルを選択してください。"; return; }
  if (!title) { statusEl.textContent = "タイトルを入力してください。"; return; }

  const errs = validateSections(section1, section2, section3);
  if (errs.length) { statusEl.textContent = errs.join(" / "); return; }

  const user = auth.currentUser;
  if (!user) { alert("ログインしてください。"); return; }

  try {
    // 直接Firestoreに保存（AIチェックは確認ボタンで済み）
    await db.collection("stories").add({
      uid: user.uid,
      title: title,
      genre: genre,
      section1: section1, 
      section2: section2, 
      section3: section3,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      currentVersion: 1,
      status: status,
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

// ページ読み込み完了時の処理
document.addEventListener("DOMContentLoaded", function() {
  console.log("Safari version: DOMContentLoaded fired");

  // Firebase初期化
  if (!initializeFirebase()) {
    console.error("Firebase initialization failed");
    
    // Firebase初期化失敗時は即座にログインモーダルを表示
    const loginModal = document.getElementById("login-required-modal");
    if (loginModal && form) {
      form.style.display = "none";
      loginModal.style.display = "flex";
    }
    return;
  }

  // Firebase接続チェック
  if (!checkFirebaseConnection()) {
    console.error("Firebase initialization failed");
    
    // Firebase接続失敗時は強制的にログインモーダルを表示
    const loginModal = document.getElementById("login-required-modal");
    if (loginModal) {
      loginModal.style.display = "flex";
      // エラーメッセージを表示
      loginModal.innerHTML = `
        <div style="border:1px solid #e0e0e0;border-radius:12px;padding:2.5rem;background:#ffffff;box-shadow:0 8px 24px rgba(0,0,0,0.15);text-align:center;max-width:400px;margin:1rem;position:relative;">
          <div style="font-size:1.3rem;margin-bottom:1.5rem;color:#c62828;font-weight:600;">接続中...</div>
          <p>Firebase接続に時間がかかっています。<br>投稿にはログインが必要です。</p>
          <a href="login.php" style="display:inline-block;padding:0.8rem 2rem;background:#444;color:white;text-decoration:none;border-radius:8px;transition:background 0.2s;font-weight:500;margin-bottom:1rem;">
            ログインはこちらから
          </a>
          <div style="margin-top:1rem;">
            <button onclick="window.location.href='index.php'" style="background:none;border:1px solid #ddd;padding:0.6rem 1.5rem;border-radius:6px;color:#666;cursor:pointer;transition:all 0.2s;">
              トップページに戻る
            </button>
          </div>
        </div>
      `;
    }
    return; // Firebase接続エラーの場合は処理を停止
  }

  // 文字カウンター初期化
  initializeCounters();

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
  auth.onAuthStateChanged(function(user) {
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

  // Firebase初期化失敗時のフォールバック（3秒待機）
  setTimeout(function() {
    // もしフォームもモーダルも表示されていない場合は強制的にモーダル表示
    const loginModal = document.getElementById("login-required-modal");
    if (form.style.display === "none" && (!loginModal || loginModal.style.display === "none")) {
      console.warn("Safari: Firebase認証状態不明 - 強制的にログインモーダル表示");
      if (loginModal) {
        loginModal.style.display = "flex";
      }
    }
  }, 3000);

  // モーダルのキャンセルボタン
  const modalCloseBtn = document.getElementById("modal-close-btn");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", function() {
      window.location.href = "index.php";
    });
  }

  // モーダル背景クリックで閉じる
  const loginModal = document.getElementById("login-required-modal");
  if (loginModal) {
    loginModal.addEventListener("click", function(e) {
      if (e.target === loginModal) {
        window.location.href = "index.php";
      }
    });
  }

  // 確認（プレビューを表示 + AIチェック）
  if (previewBtn) {
    previewBtn.addEventListener("click", async function() {
      statusEl.textContent = "";

      const title    = trim(document.getElementById("title") ? document.getElementById("title").value : "");
      const section1 = trim(document.getElementById("section1") ? document.getElementById("section1").value : "");
      const section2 = trim(document.getElementById("section2") ? document.getElementById("section2").value : "");
      const section3 = trim(document.getElementById("section3") ? document.getElementById("section3").value : "");

      const errs = validateSections(section1, section2, section3);
      if (!title) errs.unshift("タイトルを入力してください。");
      if (errs.length) { statusEl.textContent = errs.join(" / "); return; }

      const genre = document.getElementById("genre") ? document.getElementById("genre").value : "";
      if (!genre) { statusEl.textContent = "ジャンルを選択してください。"; return; }

      const user = auth.currentUser;
      if (!user) { alert("ログインしてください。"); return; }

      const storyData = {
        genre: genre,
        title: title,
        section1: section1,
        section2: section2,
        section3: section3
      };

      // Firestoreにバックアップを保存
      // バックアップ保存（エラーでも続行）
      let backupId = null;
      try {
        backupId = await saveBackupToFirestore(storyData, user.uid);
      } catch (error) {
        console.error('Backup failed, but continuing with moderation:', error);
      }

      // 確認ボタンを無効化してローディング表示
      const originalPreviewText = previewBtn.textContent;
      previewBtn.disabled = true;
      previewBtn.textContent = "AIが内容をチェック中...";

      statusEl.style.color = "#666";
      statusEl.textContent = "AIがコンテンツの安全性をチェックしています...";

      try {
        // AIモデレーションチェック
        const moderationResult = await checkContentModeration(storyData);
        
        if (!moderationResult.safe && moderationResult.flagged) {
          // 有害コンテンツが検出された場合
          showModerationWarningModal(moderationResult, backupId);
          statusEl.style.color = "red";
          statusEl.textContent = "投稿内容を確認してください。修正後に再度お試しください。";
          
          // ボタンを復元
          previewBtn.disabled = false;
          previewBtn.textContent = originalPreviewText;
          return;
        }

        // AIチェック通過：プレビューを表示
        const assembled = "【ジャンル】" + genre + "\n【タイトル】" + title + "\n\n" + buildStory(section1, section2, section3);
        previewContent.textContent = assembled;
        previewArea.style.display = "block";
        window.scrollTo({ top: previewArea.offsetTop - 20, behavior: "smooth" });

        statusEl.style.color = "green";
        statusEl.textContent = "AIチェック完了。内容を確認して投稿してください。";

        // ボタンを復元
        previewBtn.disabled = false;
        previewBtn.textContent = originalPreviewText;

        // バックアップを削除（チェック成功時）
        if (backupId) {
          await removeBackupFromFirestore(backupId);
        }

      } catch (error) {
        console.error("AIチェックエラー:", error);
        statusEl.style.color = "red";
        statusEl.textContent = "AIチェックでエラーが発生しました。再度お試しください。";
        
        // ボタンを復元
        previewBtn.disabled = false;
        previewBtn.textContent = originalPreviewText;
      }
    });
  }

  // プレビュー → 編集に戻る
  if (backEditBtn) {
    backEditBtn.addEventListener("click", function() {
      previewArea.style.display = "none";
    });
  }

  // プレビュー → 公開する
  if (publishBtn) {
    publishBtn.addEventListener("click", async function() {
      await saveStory({ status: "pending" }); // published → pending に変更
    });
  }

  // 下書き保存
  if (draftBtn) {
    draftBtn.addEventListener("click", async function() {
      await saveStory({ status: "draft" });
    });
  }
});