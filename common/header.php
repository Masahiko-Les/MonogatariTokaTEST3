<header>

  <!-- 上段：ロゴとログイン系 -->
  <div class="header-top">
    <a href="index.php" class="logo">物語灯花</a>

<div class="nav-buttons">
  <!-- ▼ 未ログイン時に表示するプルダウン -->
  <div class="menu-item has-dropdown auth-dropdown" id="auth-menu">
    <a href="#" class="menu-link btn-like" id="auth-trigger" aria-haspopup="true" aria-expanded="false">ログイン</a>
    <div class="dropdown" role="menu">
      <a href="login.php" class="dropdown-link">ログイン</a>
      <a href="register.php" class="dropdown-link">新規登録</a>
    </div>
  </div>

  <!-- ▼ ログイン時に表示する部分 -->
  <span id="user-info" class="user-info" style="margin-left:10px;"></span>
  <button id="logout-btn" class="logout-btn" style="display:none;">ログアウト</button>
</div>
  </div>

  <!-- 下段：メニュー -->
  <div class="main-buttons">
    <div class="menu-item has-dropdown">
      <a href="list.php" class="menu-link" aria-haspopup="true" aria-expanded="false">物語を読む</a>
        <div class="dropdown" role="menu">
          <a href="list.php" class="dropdown-link">吃音</a>
          <a href="list.php" class="dropdown-link">うつ</a>
          <a href="list.php" class="dropdown-link">いじめ</a>
          <a href="list.php" class="dropdown-link">障害児の子育て</a>
        </div>
    </div>

    
    <a href="post.php"  class="menu-link">物語を書く</a>
    <a href="mypage.php" class="menu-link">マイページ</a>
    <a href="this_site.php" class="menu-link">このサイトについて</a>
  </div>

</header>
<script type="module" src="auth.js"></script>

<!-- プルダウンのJS -->
<script>
document.querySelectorAll('.menu-item.has-dropdown > .menu-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const item = link.parentElement;
    const open = item.classList.toggle('open');
    link.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});

// 外側クリックで閉じる
document.addEventListener('click', e => {
  document.querySelectorAll('.menu-item.has-dropdown.open').forEach(item => {
    if (!item.contains(e.target)) {
      item.classList.remove('open');
      const link = item.querySelector('.menu-link');
      if (link) link.setAttribute('aria-expanded','false');
    }
  });
});

// Escキーで閉じる
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.menu-item.has-dropdown.open')
      .forEach(item => item.classList.remove('open'));
  }
});
</script>

<script>
  // ログイン用ドロップダウン（クリックで開閉）
  const authMenu = document.getElementById('auth-menu');
  const authTrigger = document.getElementById('auth-trigger');

  if (authMenu && authTrigger) {
    authTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const open = authMenu.classList.toggle('open');
      authTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // 外側クリックで閉じる
    document.addEventListener('click', (e) => {
      if (!authMenu.contains(e.target)) {
        authMenu.classList.remove('open');
        authTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Escで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        authMenu.classList.remove('open');
        authTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap');

/* ヘッダー全体を縦2段にする */
header{
    display:flex;
    flex-direction: column;   /* ←これが肝 */
    border-bottom: 1px solid #ddd;
}

/* 上段：ロゴ＋ログイン */
.header-top {
  display: flex;
  justify-content: space-between; /* ロゴ左、ログイン右 */
  align-items: center;
  padding: 0.8em 0;
}

.logo {
    font-size: 2em;
    font-weight: bold;
    text-decoration: none;
    color: #333;
    font-family: 'Noto Serif JP', serif;
}

.nav-buttons {
  display: flex;
  align-items: center;
  gap: 1em;
}

.nav-buttons button {
  padding: 0.4em 1em;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

/* ログインの見た目を “ボタン風” に */
.auth-dropdown > .menu-link.btn-like{
  border:1px solid #ccc;
  background:#fff;
  border-radius:6px;
  padding:.45em 1em;
  font-weight:400;
  display:inline-block;
}
.auth-dropdown > .menu-link.btn-like:hover{ background:#f7f7f7; }

/* 右上のログイン（トリガー）だけ文字サイズ変更 */
.nav-buttons .auth-dropdown .menu-link.btn-like{
  font-size: 0.9rem; /* 例: 18px。お好みで 1rem=16px / .875rem=14px など */
}



/* 下段：メニュー */
.main-buttons {
  display: flex;
  justify-content: flex-start; 
  gap: 1.5em;
  padding: 0.6em 0;
}

.main-buttons .menu-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 0.8rem; 
  padding: 0.3em 0.8em;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.main-buttons .menu-link:hover {
  background-color: #f7f7f7;
    color: #111;
}

/* プルダウン */
/* ドロップダウンの土台 */
.menu-item{ position:relative; }


/* パネル本体 */
.dropdown{
  position:absolute; top:calc(100% + 12px); left:0;
  min-width:200px; background:#fff;
  border:1px solid #e6e6e6; border-radius:10px;
  box-shadow:0 8px 28px rgba(0,0,0,.12);
  padding:8px 0; z-index:1000;

  opacity:0; transform:translateY(6px);
  pointer-events:none;
  transition:opacity .15s ease, transform .15s ease;
}

/* ホバー／フォーカスで表示（PC・キーボード操作に対応） */
.menu-item:hover .dropdown,
.menu-item:focus-within .dropdown{
  opacity:1; transform:translateY(0); pointer-events:auto;
}

/* リスト内リンク */
.dropdown-link{
  display:block; padding:10px 16px;
  color:#333; text-decoration:none; white-space:nowrap;
}
.dropdown-link:hover{ background:#f7f7f7; }

/* クリックで開く用（タッチ端末） */
.menu-item.open .dropdown{
  opacity:1; transform:translateY(0); pointer-events:auto;
}

</style>