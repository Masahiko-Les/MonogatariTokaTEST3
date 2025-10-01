<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Summary Field Cleanup</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        button {
            background: #dc3545;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover { background: #c82333; }
        .safe-button {
            background: #28a745;
        }
        .safe-button:hover { background: #218838; }
        #log {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 15px;
            border-radius: 5px;
            min-height: 200px;
            font-family: monospace;
            white-space: pre-wrap;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📦 Summary Field Cleanup Tool</h1>
        
        <div class="warning">
            <strong>⚠️ 注意:</strong><br>
            このツールは既存のストーリーから<code>summary</code>フィールドを削除します。<br>
            現在、<code>section1</code>でプレビュー表示を行っているため、<code>summary</code>は不要になりました。<br>
            実行前にデータベースのバックアップを推奨します。
        </div>

        <div style="margin: 20px 0;">
            <h3>削除される項目:</h3>
            <ul>
                <li><code>summary</code> フィールド（各ストーリーから）</li>
            </ul>
        </div>

        <button onclick="cleanupSummaryField()" style="background: #dc3545;" id="deleteBtn" disabled>
            🗑️ Summary Field を削除実行
        </button>
        
        <button onclick="simulateCleanup()" class="safe-button" id="simulateBtn" disabled>
            🔍 シミュレーション実行（削除なし）
        </button>

        <!-- ログイン用フォーム -->
        <div id="loginForm" style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 5px;">
            <h3>管理者ログイン</h3>
            <input type="email" id="email" placeholder="メールアドレス" style="width: 200px; padding: 8px; margin: 5px;">
            <input type="password" id="password" placeholder="パスワード" style="width: 200px; padding: 8px; margin: 5px;">
            <button onclick="login()" style="background: #007bff;">ログイン</button>
            <div id="loginStatus" style="margin-top: 10px; color: #dc3545;"></div>
        </div>

        <div id="log"></div>
    </div>

    <!-- Firebase -->
    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
        import { 
            getAuth, 
            signInWithEmailAndPassword,
            onAuthStateChanged 
        } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
        import { 
            getFirestore, 
            collection, 
            getDocs, 
            doc, 
            updateDoc,
            deleteField
        } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

        // Firebase設定
        const firebaseConfig = {
            apiKey: "AIzaSyD3-O0H5SCMWg3Nm-_ihkiGC7-ldPp8dCs",
            authDomain: "monogataritokatest4.firebaseapp.com",
            projectId: "monogataritokatest4",
            storageBucket: "monogataritokatest4.firebasestorage.app",
            messagingSenderId: "386735722875",
            appId: "1:386735722875:web:34ba2a3536bf84321eadde"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        let currentUser = null;

        // 認証状態の監視
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            updateUI();
        });

        function logMessage(message) {
            const logElement = document.getElementById('log');
            const timestamp = new Date().toLocaleTimeString();
            logElement.textContent += `[${timestamp}] ${message}\n`;
            logElement.scrollTop = logElement.scrollHeight;
        }

        // UI更新
        function updateUI() {
            const deleteBtn = document.getElementById('deleteBtn');
            const simulateBtn = document.getElementById('simulateBtn');
            const loginForm = document.getElementById('loginForm');
            const loginStatus = document.getElementById('loginStatus');

            if (currentUser) {
                deleteBtn.disabled = false;
                simulateBtn.disabled = false;
                loginForm.style.display = 'none';
                logMessage(`✅ ログイン成功: ${currentUser.email}`);
            } else {
                deleteBtn.disabled = true;
                simulateBtn.disabled = true;
                loginForm.style.display = 'block';
                loginStatus.textContent = '';
            }
        }

        // ログイン機能
        window.login = async function() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginStatus = document.getElementById('loginStatus');

            if (!email || !password) {
                loginStatus.textContent = 'メールアドレスとパスワードを入力してください。';
                return;
            }

            try {
                await signInWithEmailAndPassword(auth, email, password);
                loginStatus.textContent = '';
            } catch (error) {
                loginStatus.textContent = `ログインエラー: ${error.message}`;
                logMessage(`ログインエラー: ${error.message}`);
            }
        };

        // シミュレーション実行
        window.simulateCleanup = async function() {
            if (!currentUser) {
                logMessage("❌ ログインが必要です。");
                return;
            }

            logMessage("=== Summary Field Cleanup シミュレーション開始 ===");
            
            try {
                const storiesRef = collection(db, "stories");
                const snapshot = await getDocs(storiesRef);
                
                let totalStories = 0;
                let storiesWithSummary = 0;
                
                snapshot.forEach((doc) => {
                    totalStories++;
                    const data = doc.data();
                    
                    if (data.summary !== undefined) {
                        storiesWithSummary++;
                        logMessage(`Found summary in story: ${doc.id} (${data.title || 'No title'})`);
                        logMessage(`  Summary length: ${data.summary ? data.summary.length : 0} characters`);
                    }
                });
                
                logMessage(`\n=== シミュレーション結果 ===`);
                logMessage(`総ストーリー数: ${totalStories}`);
                logMessage(`summaryフィールドを持つストーリー: ${storiesWithSummary}`);
                logMessage(`削除予定フィールド数: ${storiesWithSummary}`);
                
                if (storiesWithSummary > 0) {
                    logMessage(`\n推定ストレージ削減: ~${Math.round(storiesWithSummary * 0.2)}KB`);
                }
                
                logMessage("=== シミュレーション完了 ===");
                
            } catch (error) {
                logMessage(`エラー: ${error.message}`);
            }
        };

        // 実際のクリーンアップ実行
        window.cleanupSummaryField = async function() {
            if (!currentUser) {
                logMessage("❌ ログインが必要です。");
                return;
            }

            if (!confirm("本当にsummaryフィールドを削除しますか？この操作は元に戻せません。")) {
                return;
            }
            
            logMessage("=== Summary Field Cleanup 実行開始 ===");
            
            try {
                const storiesRef = collection(db, "stories");
                const snapshot = await getDocs(storiesRef);
                
                let totalStories = 0;
                let deletedFields = 0;
                let errors = 0;
                
                for (const docSnapshot of snapshot.docs) {
                    totalStories++;
                    const data = docSnapshot.data();
                    
                    if (data.summary !== undefined) {
                        try {
                            await updateDoc(doc(db, "stories", docSnapshot.id), {
                                summary: deleteField()
                            });
                            deletedFields++;
                            logMessage(`✅ Deleted summary from: ${docSnapshot.id} (${data.title || 'No title'})`);
                        } catch (error) {
                            errors++;
                            logMessage(`❌ Error deleting summary from ${docSnapshot.id}: ${error.message}`);
                        }
                    }
                }
                
                logMessage(`\n=== クリーンアップ完了 ===`);
                logMessage(`総ストーリー数: ${totalStories}`);
                logMessage(`削除されたsummaryフィールド: ${deletedFields}`);
                logMessage(`エラー数: ${errors}`);
                
                if (deletedFields > 0) {
                    logMessage(`\n🎉 summaryフィールドの削除が完了しました！`);
                    logMessage(`ストレージ使用量が削減されました。`);
                }
                
            } catch (error) {
                logMessage(`重大なエラー: ${error.message}`);
            }
        };

        // 初期メッセージ
        logMessage("Summary Field Cleanup Tool が読み込まれました。");
        logMessage("管理者としてログインしてからツールをご利用ください。");
    </script>
</body>
</html>