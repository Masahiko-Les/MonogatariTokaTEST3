// AI_Moderation.js - AIモデレーション機能モジュール
// 暴力的コンテンツやハラスメントの検出機能

/**
 * テキストをチャンクに分割する関数
 * @param {Object} storyData - ストーリーデータ（title, section1, section2, section3）
 * @returns {Array} チャンク配列
 */
function createTextChunks(storyData) {
  const { title, section1, section2, section3 } = storyData;
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
  
  sections.forEach(section => {
    if (section.text && section.text.trim()) {
      // 文単位で分割（。や！、？で区切る）
      const sentences = section.text.split(/(?<=[。！？])\s*/)
        .filter(sentence => sentence.trim().length > 0)
        .map(sentence => sentence.trim());
      
      if (sentences.length <= 1) {
        // 短い場合はそのまま1つのチャンク
        chunks.push({
          section: section.name,
          text: section.text.trim()
        });
      } else {
        // 長い場合は文単位でチャンク分割
        sentences.forEach((sentence, index) => {
          if (sentence.trim()) {
            chunks.push({
              section: `${section.name} (${index + 1}文目)`,
              text: sentence
            });
          }
        });
      }
    }
  });
  
  return chunks;
}

/**
 * AIモデレーションチェック関数（チャンク対応版）
 * @param {Object} storyData - ストーリーデータ
 * @returns {Promise<Object>} モデレーション結果
 */
async function checkContentModeration(storyData) {
  try {
    const chunks = createTextChunks(storyData);
    
    const response = await fetch('moderation_check.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chunks })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('Moderation check failed:', error);
    // エラーの場合は安全側に倒して通す（サービス継続性のため）
    return { safe: true, flagged: false, error: error.message };
  }
}

/**
 * モデレーション警告モーダルを表示（チャンク対応版）
 * @param {Object} moderationResult - モデレーション結果
 * @param {string} backupId - バックアップID（オプション）
 */
function showModerationWarningModal(moderationResult, backupId = null) {
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
    
    flaggedChunks.forEach((chunk, index) => {
      contentHTML += `<div class="flagged-chunk">`;
      contentHTML += `<h4 class="section-title">${chunk.section}</h4>`;
      contentHTML += `<div class="flagged-text">"${chunk.text}"</div>`;
      
      // categoriesはオブジェクト形式なので適切に処理
      if (chunk.categories && typeof chunk.categories === 'object') {
        const flaggedCategories = Object.entries(chunk.categories)
          .filter(([_, flagged]) => flagged)
          .map(([category, _]) => categoryTranslations[category] || category);
          
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
          const categoryList = chunk.flagged_categories.map(cat => categoryTranslations[cat] || cat).join(', ');
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
      const flaggedCategories = Object.entries(categories)
        .filter(([_, flagged]) => flagged)
        .map(([category, _]) => categoryTranslations[category] || category);
        
      if (flaggedCategories.length > 0) {
        contentHTML += '<p>投稿内容に以下のような要素が含まれている可能性があります：</p>';
        contentHTML += '<ul>';
        flaggedCategories.forEach(cat => {
          contentHTML += `<li>${cat}</li>`;
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
    editBtn.addEventListener("click", () => {
      document.getElementById("moderation-modal").remove();
      // フォームに戻る（何もしない）
    });
  }
}

/**
 * 管理画面用：モデレーション結果を表示する関数
 * @param {Object} moderationResult - モデレーション結果
 * @param {string} containerId - 結果を表示するコンテナのID
 */
function displayModerationResult(moderationResult, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Container not found:', containerId);
    return;
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
  
  let resultHTML = '';
  
  if (moderationResult.safe) {
    resultHTML = `
      <div class="moderation-result safe">
        <h4>✅ AI判定: 安全</h4>
        <p>問題のあるコンテンツは検出されませんでした。</p>
      </div>
    `;
  } else {
    resultHTML = `
      <div class="moderation-result flagged">
        <h4>⚠️ AI判定: 要確認</h4>
        <p>以下の問題が検出されました：</p>
    `;
    
    const flaggedChunks = moderationResult.flaggedChunks || moderationResult.flagged_chunks;
    
    if (flaggedChunks && flaggedChunks.length > 0) {
      resultHTML += '<div class="flagged-chunks">';
      flaggedChunks.forEach((chunk, index) => {
        resultHTML += `
          <div class="flagged-chunk">
            <h5>${chunk.section}</h5>
            <div class="flagged-text">"${chunk.text}"</div>
        `;
        
        if (chunk.categories && typeof chunk.categories === 'object') {
          const flaggedCategories = Object.entries(chunk.categories)
            .filter(([_, flagged]) => flagged)
            .map(([category, _]) => categoryTranslations[category] || category);
          
          if (flaggedCategories.length > 0) {
            resultHTML += `<div class="violation-categories">問題の種類: ${flaggedCategories.join(', ')}</div>`;
          }
        }
        
        resultHTML += '</div>';
      });
      resultHTML += '</div>';
    }
    
    resultHTML += '</div>';
  }
  
  container.innerHTML = resultHTML;
}

// ES6モジュールとして関数をエクスポート
export {
  createTextChunks,
  checkContentModeration,
  showModerationWarningModal,
  displayModerationResult
};

// CommonJS環境での互換性のため
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createTextChunks,
    checkContentModeration,
    showModerationWarningModal,
    displayModerationResult
  };
}