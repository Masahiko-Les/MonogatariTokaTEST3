// admin_utils.js - 管理者権限チェック用ユーティリティ
import { auth, db } from "./firebaseConfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// 現在のユーザーが管理者かどうかをチェック
export async function isAdmin(user = null) {
  const currentUser = user || auth.currentUser;
  if (!currentUser) return false;
  
  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    return userData.role === "admin";
  } catch (error) {
    console.error("管理者権限チェックエラー:", error);
    return false;
  }
}

// 管理者権限が必要なページで使用するガード関数
export async function requireAdmin() {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    alert("管理者権限が必要です。");
    window.location.href = "index.php";
    return false;
  }
  return true;
}