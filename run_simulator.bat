@echo off
echo ====================================================
echo Starting SWCMS Waste Simulator...
echo ====================================================
cd /d "%~dp0simulator"
python waste_generator.py
pause
