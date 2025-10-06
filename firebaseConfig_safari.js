// firebaseConfig_safari.js - Safari対応版（Compat SDK使用）
// Firebase Compat SDK - 従来型のSDKでES6 Modulesを使わない

// Firebase設定オブジェクト
const firebaseConfig = {
  apiKey: "AIzaSyD3-O0H5SCMWg3Nm-_ihkiGC7-ldPp8dCs",
  authDomain: "monogataritokatest4.firebaseapp.com",
  projectId: "monogataritokatest4",
  storageBucket: "monogataritokatest4.firebasestorage.app",
  messagingSenderId: "386735722875",
  appId: "1:386735722875:web:34ba2a3536bf84321eadde"
};

// Firebase初期化（Compat SDK使用）
try {
  // Firebase アプリを初期化
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  console.log("Firebase Safari version initialized successfully");
  
  // デバッグ情報
  console.log("Firebase compat available:", !!firebase);
  console.log("Firebase auth available:", !!firebase.auth);
  console.log("Firebase firestore available:", !!firebase.firestore);
  
} catch (error) {
  console.error('Firebase Safari initialization failed:', error);
}