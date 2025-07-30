@echo off
echo ====================================
echo NTS SCHOOL VIDEO CALL TEST SCRIPT
echo ====================================
echo.

echo Step 1: Starting Backend Server...
echo Opening new terminal for backend...
start "NTS Backend" powershell -Command "cd 'c:\Users\aditya\Desktop\NTS_SCHOOL\backend'; Write-Host 'Starting backend server...' -ForegroundColor Green; npm run dev"

timeout /t 5 /nobreak > nul

echo Step 2: Starting Frontend Server...  
echo Opening new terminal for frontend...
start "NTS Frontend" powershell -Command "cd 'c:\Users\aditya\Desktop\NTS_SCHOOL\frontend'; Write-Host 'Starting frontend server...' -ForegroundColor Blue; npm run dev"

timeout /t 3 /nobreak > nul

echo Step 3: Opening Browser...
echo Waiting for servers to start...
timeout /t 10 /nobreak > nul

echo Opening Live Classes page...
start http://localhost:5173/live-classes

echo.
echo ====================================
echo TEST SETUP COMPLETE!
echo ====================================
echo.
echo NEXT STEPS:
echo 1. Wait for both servers to fully start
echo 2. Check that the Live Classes page loads
echo 3. Follow the test checklist in VIDEO_CALL_IMPLEMENTATION.md
echo.
echo SERVERS RUNNING:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo - Live Classes: http://localhost:5173/live-classes
echo.
echo Press any key to close this window...
pause > nul
