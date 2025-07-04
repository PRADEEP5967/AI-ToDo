@echo off
echo ========================================
echo    Smart Todo - Full Stack Setup
echo ========================================
echo.

echo Starting Django Backend Server...
echo.
cd backend
call venv\Scripts\activate
start "Django Backend" cmd /k "python manage.py runserver 0.0.0.0:8000"
echo Backend server starting on http://localhost:8000
echo.

echo Starting Next.js Frontend Server...
echo.
cd ..\frontend
start "Next.js Frontend" cmd /k "npm run dev"
echo Frontend server starting on http://localhost:3000
echo.

echo ========================================
echo    🎉 Both servers are starting!
echo ========================================
echo.
echo Backend API:  http://localhost:8000/api/
echo Frontend App: http://localhost:3000
echo Admin Panel:  http://localhost:8000/admin/
echo.
echo Admin credentials: admin / admin123
echo.
echo Press any key to exit this setup script...
pause > nul 