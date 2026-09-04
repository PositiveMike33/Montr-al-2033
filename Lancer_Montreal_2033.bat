@echo off
title Montreal 2033 - Neural Overload
cd /d "%~dp0"
echo =====================================================================
echo  [MTL 2033] DEMARRAGE DU SERVEUR DE JEU ET DU MOTEUR DE COMBAT FF
echo =====================================================================
echo  Port: 3034 (Serveur Express Full-Stack + UI Vite)
echo  URL:  http://127.0.0.1:3034
echo =====================================================================

:: Ouvre Chrome en mode Application plein ecran
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:3034 --start-maximized

:: Lance le serveur de developpement
npm run dev
