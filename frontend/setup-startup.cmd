@echo off
echo ===================================================
echo Setting up Automatic Background Startup
echo ===================================================
set "VBS_FILE=%~dp0start-hidden.vbs"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

if not exist "%VBS_FILE%" (
    echo Error: start-hidden.vbs not found!
    pause
    exit /b
)

echo Copying startup script to Windows Startup folder...
copy "%VBS_FILE%" "%STARTUP_FOLDER%\LawyerManagerServer.vbs" /Y >nul

echo.
echo SUCCESS! The server will now start automatically in the background every time Windows starts.
echo You can also double click start-hidden.vbs anytime to start it in the background now.
echo.
pause
