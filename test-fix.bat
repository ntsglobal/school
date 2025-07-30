@echo off
echo Starting Backend Server...
cd c:\Users\aditya\Desktop\NTS_SCHOOL\backend
start "Backend Server" cmd /k "npm run dev"

echo Waiting for backend to start...
timeout /t 5

echo Starting Frontend Server...
cd c:\Users\aditya\Desktop\NTS_SCHOOL\frontend
start "Frontend Server" cmd /k "npm run dev"

echo Waiting for frontend to start...
timeout /t 3

echo Opening browser...
start http://localhost:5173

echo.
echo Both servers should now be running:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
echo Check the terminal windows for any errors.
echo The 'socket.io-client' import issue should now be resolved.
pause
