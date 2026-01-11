@echo off
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0

echo Starting NIS portal services...

rem Start backend in a new window (installs deps then runs dev script)
start "NIS Backend" cmd /k "cd /d "%SCRIPT_DIR%nis-portal-backend" && echo Installing backend dependencies... && npm install && echo Starting backend (npm run dev)... && npm run dev"

rem Start frontend in a new window (installs deps then runs start)
start "NIS Frontend" cmd /k "cd /d "%SCRIPT_DIR%nis-portal-frontend" && echo Installing frontend dependencies... && npm install && echo Starting frontend (npm start)... && npm start"

rem Wait briefly then open the frontend in the default browser
timeout /t 5 /nobreak >nul
start "" "http://localhost:3001"

echo All start commands issued. Check the opened terminals for logs.
endlocal

