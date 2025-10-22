<footer class="site-footer">
    
    <div class="logo">物語灯花</div>
    <div class="tagline">あなたのストーリーが、誰かの力になる。</div>

    <div class="footer-container">
        <div class="footer-column">
            <h3>Category</h3>
            <ul>
                <li><a href="list.php?category=吃音">吃音</a></li>
                <li><a href="list.php?category=うつ">うつ</a></li>
                <li><a href="list.php?category=いじめ">いじめ</a></li>
                <li><a href="list.php?category=障害児の子育て">障害児の子育て</a></li>
                <li><a href="list.php?category=摂食障害">摂食障害</a></li>
            </ul>
        </div>
        
        <div class="footer-column">
            <h3>Story</h3>
            <ul>
                <li><a href="index.php">物語を読む</a></li>
                <li><a href="post.php">物語を書く</a></li>
            </ul>
        </div>
        
        <div class="footer-column">
            <h3>Website</h3>
            <ul>
                <li><a href="mypage.php">マイページ</a></li>
                <li><a href="this_site.php">このサイトについて</a></li>
            </ul>
        </div>

        <div class="footer-column">
            <h3>SNS</h3>
            <ul>
                <li><a href="#">SNSで投稿する</a></li>
                <li>
                    <div class="social-icons">
                        <a href="#" class="social-link">
                            <i class="fa-brands fa-square-x-twitter"></i>
                        </a>
                        <a href="#" class="social-link">
                            <i class="fa-brands fa-square-facebook"></i>
                        </a>
                        <a href="#" class="social-link">
                            <i class="fa-brands fa-line"></i>
                        </a>
                    </div>
                </li>
            </ul>
        </div>
    </div>

    <div class="footer-bottom">
        <!-- 追悼メッセージ -->
        <div class="dedication">
            <img src="img/kasumisou_transparent.png" alt="霞草" class="kasumisou-icon">
            <p class="dedication-text">このWebアプリは、17年間闘病生活を送り、2025年7月に亡くなった母親に捧げます</p>
        </div>
        
        <p>&copy; 2025 物語灯花/icon by <a href="https://icons8.jp/">icon8</a></p>
    </div>
</footer>

<!-- FontAwesome CDN を読み込み -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap');

.logo {
    font-size: 2em;
    font-weight: bold;
    text-decoration: none;
    color: #333;
    font-family: 'Noto Serif JP', serif;
}

.tagline {
    font-size: 14px;
    color: #666;
    margin-top: 5px;
    margin-bottom: 30px;
}

.site-footer {
    background-color: #fafafa;
    border-top: 1px solid #e9ecef;
    padding: 30px 0 20px 0;
    margin-top: 50px;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    gap: 40px;
}

.footer-column {
    flex: 1;
}

.footer-column h3 {
    color: #333;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;

    padding-bottom: 5px;
}

.footer-column ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-column li {
    margin-bottom: 8px;
}

.footer-column a {
    color: #666;
    text-decoration: none;
    transition: color 0.3s ease;
    font-size: 14px;
}

.footer-column a:hover {
    color: #007bff;
    text-decoration: underline;
}

.footer-bottom {
    text-align: center;
    margin-top: 5px;
    padding-top: 5px;
}

.footer-bottom p {
    margin: 0;
    color: #666;
    font-size: 14px;
}

/* 追悼メッセージスタイル */
.dedication {
    padding: 0px 0px 5px 20px;
    margin: 0 auto;
    max-width: 800px;
}

.kasumisou-icon {
    width: 240px;
    height: 240px;
    margin-bottom: 1px;
    opacity: 0.9;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    background: transparent;
    object-fit: contain;
}

.dedication-text {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
    font-weight: normal;
    letter-spacing: normal;
}

/* フッターカラム内のソーシャルアイコン用 */
.footer-column .social-icons {
    text-align: left;
}

.social-link {
    display: inline-block;
    text-decoration: none;
    margin-left: 10px;
}

.social-link i {
    font-size: 28px;
    line-height: 28px;
    vertical-align: middle;
}

/* LINEアイコンのサイズ調整 */
.social-link .fa-line {
    font-size: 25px;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
    .footer-container {
        flex-direction: column;
        gap: 20px;
    }
    
    .footer-column {
        text-align: center;
    }
    
    .footer-column h3 {
        font-size: 16px;
    }
    
    .dedication {
        margin: 0 20px 20px 20px;
        padding: 20px 15px;
    }
    
    .dedication-text {
        font-size: 15px;
    }
    
    .kasumisou-icon {
        width: 150px;
        height: 150px;
    }
}
</style>