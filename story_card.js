// story_card.js
export function createStoryCard(docSnap, options = {}) {
  const data = docSnap.data ? docSnap.data() : docSnap;
  const id = docSnap.id || data.id;

  const {
    nickname = "不明なユーザー",
    currentUserUid = null,
    reacted = false,
    onBouquet = null,
    isMyPage = false,
    bouquetCount = data.bouquets || 0 // マイページで反映されるように追加
  } = options;

  const section1 = data.section1 || data.summary || data.story || "";
  let section1Preview = section1.slice(0, 100);
  if (section1.length > 100) section1Preview += "…";

  let created = new Date();
  try {
    if (data.timestamp?.toDate) created = data.timestamp.toDate();
    else if (typeof data.timestamp === "number") created = new Date(data.timestamp);
  } catch (_) {}

  // 日時フォーマット（秒数なし）
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${year}/${month}/${day} ${hour}:${minute.toString().padStart(2, '0')}`;
  };

  // 🌱/🌸ルール
  const icon = bouquetCount > 0 ? "🌸" : "🌱";

  const card = document.createElement("div");
  card.className = "story-card";
  card.dataset.id = id;

  card.innerHTML = `
    <h3>${escapeHTML(data.title || "")}</h3>
    <p class="nickname" style="text-align: right;">投稿者：${escapeHTML(nickname)} | カテゴリー：${escapeHTML(data.genre || "未分類")} | ${formatDate(created)}</p>
    <p>${escapeHTML(section1Preview).replace(/\r?\n/g, "<br>")}</p>
    <div class="story-footer">
      ${isMyPage
        ? `
          <span class="bouquet-icon">${icon}</span>
          <span id="bouquet-count-${id}">${bouquetCount}</span>
        `
        : `
          <button class="bouquet-btn" data-id="${id}" aria-label="bouquet">
            ${reacted ? "🌸" : icon}
          </button>
          <span id="bouquet-count-${id}">${bouquetCount}</span>
        `}
    </div>
  `;

  // 🌸ボタン（トップページ専用）
  if (!isMyPage && onBouquet) {
    const btn = card.querySelector(".bouquet-btn");
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      onBouquet(id, currentUserUid);
    });
  }

  // 本文クリック → 詳細ページ
  card.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (!e.target.classList.contains("bouquet-btn")) {
      window.location.href = `story_detail.php?id=${id}`;
    }
  });

  return card;
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
