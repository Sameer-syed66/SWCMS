@echo off
echo ====================================================
echo Starting SWCMS React + Vite Frontend...
echo ====================================================
cd /d "%~dp0frontend"
set PATH=C:\Users\user\AppData\Local\Programs\nodejs;%PATH%
npm run dev
pause
