<?php
echo "iPhone Safari テスト - ファイル存在確認<br>";
echo "現在時刻: " . date('Y-m-d H:i:s') . "<br>";
echo "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "<br>";
echo "<br>";
echo "<a href='test_safari.php'>test_safari.php</a><br>";
echo "<a href='browser_test.php'>browser_test.php</a><br>";
echo "<a href='post.php'>post.php</a><br>";
echo "<a href='post_safari.php'>post_safari.php</a><br>";
?>