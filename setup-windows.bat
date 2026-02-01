@echo off
echo ========================================
echo RunFuel Setup Script (Windows)
echo ========================================
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL is not installed!
    echo.
    echo Please install MySQL:
    echo 1. Download from: https://dev.mysql.com/downloads/installer/
    echo 2. Run the installer (choose "Developer Default")
    echo 3. Set a root password during installation
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] MySQL is installed
echo.

REM Prompt for MySQL password
set /p MYSQL_PASSWORD="Enter your MySQL root password: "

echo.
echo Creating database...
mysql -u root -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS runfuel;" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database. Check your password.
    pause
    exit /b 1
)

echo [OK] Database 'runfuel' created
echo.

REM Update backend .env file
echo Updating backend configuration...
cd backend
if exist .env (
    echo [OK] .env file exists
) else (
    copy .env.example .env
    echo [OK] Created .env from template
)

REM Update MySQL password in .env
powershell -Command "(gc .env) -replace 'MYSQL_PASSWORD=.*', 'MYSQL_PASSWORD=%MYSQL_PASSWORD%' | Out-File -encoding ASCII .env"
echo [OK] MySQL password updated in .env
echo.

REM Activate virtual environment and run migrations
echo Activating virtual environment...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo [OK] Virtual environment activated
) else (
    echo [ERROR] Virtual environment not found
    echo Run: python -m venv venv
    pause
    exit /b 1
)

echo.
echo Running database migrations...
alembic upgrade head
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Migration failed
    pause
    exit /b 1
)

echo [OK] Database migrations completed
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend:  uvicorn app.main:app --reload
echo 2. Open new terminal
echo 3. Start frontend: cd frontend ^&^& npm run dev
echo 4. Visit: http://localhost:5173
echo.
pause
