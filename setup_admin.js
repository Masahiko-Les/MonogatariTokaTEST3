// setup_admin.js - 一時的な管理者設定用（開発用）
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const setupBtn = document.getElementById("setup-admin-btn");
  const statusDiv = document.getElementById("setup-status");
  
  if (setupBtn) {
    setupBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) {
        statusDiv.textContent = "ログインしてください";
        return;
      }
      
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          role: "admin"
        });
        
        statusDiv.style.color = "green";
        statusDiv.textContent = `✅ ${user.uid} を管理者に設定しました`;
        
        // 5秒後にリダイレクト
        setTimeout(() => {
          window.location.href = "Admin_page.php";
        }, 2000);
        
      } catch (error) {
        console.error("管理者設定エラー:", error);
        statusDiv.style.color = "red";
        statusDiv.textContent = "設定に失敗しました: " + error.message;
      }
    });
  }
  
  // 現在の権限確認ボタン
  const checkBtn = document.getElementById("check-role-btn");
  if (checkBtn) {
    checkBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) {
        statusDiv.textContent = "ログインしてください";
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        const role = userData?.role || "一般ユーザー";
        
        statusDiv.style.color = "blue";
        statusDiv.textContent = `現在の権限: ${role}`;
        
      } catch (error) {
        statusDiv.style.color = "red";
        statusDiv.textContent = "権限確認に失敗しました";
      }
    });
  }
});