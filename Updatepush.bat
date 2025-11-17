@echo off
echo ===================================
echo      ARDI - Git Update & Push
echo ===================================
echo.

:: Ask user for commit message
set /p msg="Enter commit message: "

echo.
echo Adding updated files...
git add .

echo Creating commit...
git commit -m "%msg%"

echo.
echo Pushing to GitHub...
git push

echo.
echo ===================================
echo         Update Completed!
echo ===================================
pause
