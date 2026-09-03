@echo off
title Montreal 2033 - Neural Overload
echo Demarrage des conteneurs Montreal 2033...
docker start montreal-2033-arpg montreal-2033-openosint ollama-sophia-elite ollama-snowflake-embed >nul 2>&1
ping 127.0.0.1 -n 2 >nul
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:3033 --start-maximized
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:3033 --start-maximized
) else (
    start http://127.0.0.1:3033
)
exit
