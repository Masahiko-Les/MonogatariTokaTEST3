// Firebase設定とインスタンスを共通ファイルからインポート
import { app, auth, db } from "./firebaseConfig.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase インスタンスを再エクスポート（他のファイルからの互換性のため）
export { app, auth, db };

// ====== DOM参照 ======
const userInfo   = document.getElementById("user-info");
const logoutBtn  = document.getElementById("logout-btn");
const authMenu   = document.getElementById("auth-menu");
const authTrigger= document.getElementById("auth-trigger");

// モバイルメニュー用
const mobileUserInfo = document.getElementById("mobile-user-info");
const mobileLogout = document.getElementById("mobile-logout");
const mobileLogin = document.getElementById("mobile-login");
const mobileRegister = document.getElementById("mobile-register");

window.currentUserId = null;

// ====== ログイン状態の監視 ======
onAuthStateChanged(auth, async (user) => {
  window.currentUserId = user ? user.uid : null;

  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let nickname = "";
      if (userDoc.exists()) {
        nickname = userDoc.data().nickname || "";
      }

      if (userInfo) {
        userInfo.textContent = nickname
          ? `${nickname} さん`
          : "ゲストさん";   // ← ニックネームが未登録ならゲストさん
      }
      
      // モバイルメニュー用
      if (mobileUserInfo) {
        mobileUserInfo.textContent = nickname
          ? `${nickname} さん`
          : "ゲストさん";
        mobileUserInfo.style.display = "block";
      }
    } catch (e) {
      console.error("ユーザープロフィール取得失敗", e);
      if (userInfo) {
        userInfo.textContent = "ゲストさん";
      }
      if (mobileUserInfo) {
        mobileUserInfo.textContent = "ゲストさん";
        mobileUserInfo.style.display = "block";
      }
    }

    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (authMenu)  authMenu.style.display  = "none";
    
    // モバイルメニュー用
    if (mobileLogout) mobileLogout.style.display = "block";
    if (mobileLogin) mobileLogin.style.display = "none";
    if (mobileRegister) mobileRegister.style.display = "none";
  } else {
    if (userInfo)  userInfo.textContent = "";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (authMenu)  authMenu.style.display  = "inline-block";
    
    // モバイルメニュー用
    if (mobileUserInfo) mobileUserInfo.style.display = "none";
    if (mobileLogout) mobileLogout.style.display = "none";
    if (mobileLogin) mobileLogin.style.display = "block";
    if (mobileRegister) mobileRegister.style.display = "block";
  }
});

// ====== ログアウト ======
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
      alert("ログアウトに失敗しました");
    }
  });
}

// モバイルメニュー用ログアウト
if (mobileLogout) {
  mobileLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
      alert("ログアウトに失敗しました");
    }
  });
}

// ====== ログイン（login.php用） ======
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email")?.value ?? "";
    const password = document.getElementById("password")?.value ?? "";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      document.getElementById("auth-status").textContent = "ログイン成功";
      
      // ログイン成功後、少し待ってからトップページにリダイレクト
      setTimeout(() => {
        window.location.href = "index.php";
      }, 1000);
      
    } catch (e) {
      document.getElementById("auth-status").textContent = "ログイン失敗: " + e.message;
    }
  });
}

// ====== 新規登録（register.php用） ======
const registerBtn = document.getElementById("register-btn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const email = document.getElementById("email")?.value ?? "";
    const password = document.getElementById("password")?.value ?? "";
    const nickname = document.getElementById("nickname")?.value ?? "";

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // Firestore に uid をドキュメントIDとして保存
      await setDoc(doc(db, "users", user.uid), {
        nickname: nickname,
        nicknameLower: nickname ? nickname.toLowerCase() : "",
        email: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      document.getElementById("auth-status").textContent = "登録＆ログイン成功";
      
      // 新規登録成功後、少し待ってからトップページにリダイレクト
      setTimeout(() => {
        window.location.href = "index.php";
      }, 1000);
      
    } catch (e) {
      console.error(e);
      document.getElementById("auth-status").textContent = "登録失敗: " + e.message;
    }
  });
}

// ====== 「ログイン」ドロップダウン（クリック開閉） ======
if (authMenu && authTrigger) {
  authTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    const open = authMenu.classList.toggle("open");
    authTrigger.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!authMenu.contains(e.target)) {
      authMenu.classList.remove("open");
      authTrigger.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      authMenu.classList.remove("open");
      authTrigger.setAttribute("aria-expanded", "false");
    }
  });
}
