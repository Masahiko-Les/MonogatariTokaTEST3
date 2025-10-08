@echo off
echo Chrome を開発者モードで起動します...
echo このモードでは証明書エラーが無視されます
echo.
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome_dev" --allow-running-insecure-content --ignore-certificate-errors http://localhost/gs_code/StoryDatabase/f_ver1/
pause