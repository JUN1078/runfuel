@echo off
echo Starting RunFuel Backend...
cd backend
call venv\Scripts\activate.bat
uvicorn app.main:app --reload
