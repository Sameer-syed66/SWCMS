@echo off
echo ====================================================
echo SWCMS Database Setup & Initialization
echo ====================================================
echo.
set /p MYSQL_PWD=Enter your MySQL root password (press Enter if blank): 

if not "%MYSQL_PWD%"=="" (
    powershell -Command "(Get-Content '%~dp0backend\.env') -replace '^MYSQL_PASSWORD=.*', 'MYSQL_PASSWORD=%MYSQL_PWD%' | Set-Content '%~dp0backend\.env'"
    echo Updated backend\.env with provided password.
)

echo.
echo Initializing database tables and seed records...
python "%~dp0backend\init_db.py"

echo.
pause
