// firebaseConfig.production.js
// 本番環境用Firebase設定ファイル - 環境変数使用版
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase設定オブジェクト（本番環境用 - 実際の値を設定してください）
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase アプリの初期化（重複初期化を防ぐ）
let app, auth, db;

try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  
  // Firebase サービスのインスタンス
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Firebaseサービスが利用できない場合でもアプリを動作させる
  auth = null;
  db = null;
}

export { app, auth, db };

// 設定オブジェクトもエクスポート（必要に応じて）
export { firebaseConfig };