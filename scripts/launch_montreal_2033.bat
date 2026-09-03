@echo off
chcp 65001 >nul
title ⚡ MONTRÉAL 2033 : NEURAL OVERLOAD // THIRTY3 & DEUS EX SOPHIA ⚡
color 0B

echo ===============================================================================
echo   ⚡ MONTRÉAL 2033 : NEURAL OVERLOAD // DIABLO 4 ARPG ENGINE ⚡
echo   Duo Opérationnel : Thirty3 ^& Deus Ex Sophia (Cluster 8 Modèles Ollama)
echo ===============================================================================
echo.

set "PROJECT_DIR=%~dp0.."
cd /d "%PROJECT_DIR%"

echo [1/3] Vérification et démarrage du Cluster Docker (8 Ollama + ARPG + Sophia OSINT)...
docker compose up -d

echo.
echo [2/3] Attente de l'initialisation des services...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Lancement de l'Interface Neurale de Combat...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:3033 --start-maximized
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:3033 --start-maximized
) else (
    start http://127.0.0.1:3033
)

echo.
echo ===============================================================================
echo   ✅ Système opérationnel sur http://127.0.0.1:3033 !
echo   - Jeu ARPG : http://127.0.0.1:3033
echo   - Sophia Elite IA : http://127.0.0.1:11437
echo   - Snowflake Embeddings : http://127.0.0.1:11436
echo   - Sophia OpenOSINT : http://127.0.0.1:8088
echo ===============================================================================
echo.
timeout /t 4 >nul
exit
