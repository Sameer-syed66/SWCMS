@echo off
echo ====================================================
echo Starting SWCMS Flask Backend Server...
echo ====================================================
cd /d "%~dp0backend"
python app.py
pause
