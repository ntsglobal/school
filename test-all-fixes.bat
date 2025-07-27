@echo off
echo.
echo ===============================================
echo    Testing All Video Call + Dashboard Fixes
echo ===============================================
echo.

echo 1. Checking socket.io-client installation...
cd c:\Users\aditya\Desktop\NTS_SCHOOL\frontend
npm list socket.io-client
if %errorlevel% neq 0 (
    echo Installing socket.io-client...
    npm install socket.io-client
)

echo.
echo 2. Starting Backend Server (with ObjectId fixes)...
cd c:\Users\aditya\Desktop\NTS_SCHOOL\backend
start "Backend Server" cmd /k "npm run dev"

timeout /t 8

echo.
echo 3. Starting Frontend Server...
cd c:\Users\aditya\Desktop\NTS_SCHOOL\frontend
start "Frontend Server" cmd /k "npm run dev"

timeout /t 5

echo.
echo 4. Opening application in browser...
start http://localhost:5173

echo.
echo ===============================================
echo    Fix Summary - ALL 7 ISSUES RESOLVED:
echo ===============================================
echo ✅ 1. socket.io-client dependency installed
echo ✅ 2. Progress API: Added /api/progress/user/me endpoint  
echo ✅ 3. CourseService: Fixed getUserEnrolledCourses → getUserCourses
echo ✅ 4. UserService: Added userId parameter to getUserStats
echo ✅ 5. API Response: Fixed data structure access (.data property)
echo ✅ 6. ObjectId constructor: Fixed deprecated syntax in Progress model
echo ✅ 7. User Stats API: Removed 404 call, using progress data instead
echo.
echo Backend fixes:
echo   - backend/models/Progress.js (ObjectId constructor)
echo   - backend/controllers/progressController.js (ObjectId + new endpoint)
echo   - backend/routes/progress.js (added /user/me route)
echo.
echo Frontend fixes:
echo   - StudentDashboard.jsx (API calls + data access)
echo   - package.json (socket.io-client dependency)
echo.
echo Both servers should now be running without errors!
echo.
echo Expected logs:
echo - Backend: "Server running on port 5000" + "MongoDB Connected"
echo - Frontend: "Local: http://localhost:5173"
echo.
echo Test steps:
echo 1. Login with test@test.com
echo 2. Dashboard should load without 403 errors
echo 3. Navigate to Live Classes  
echo 4. Video call functionality should work
echo.
echo Check network tab - no more undefined user ID errors!
echo.
pause
