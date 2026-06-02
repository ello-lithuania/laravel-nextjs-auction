@echo off
REM Double-click to deploy to Hostinger (or run: deploy.bat web | api | all)
REM Wraps deploy.sh using Git Bash. No GitHub Actions, no CI, no IP blocks.
setlocal
set "BASH=C:\Program Files\Git\bin\bash.exe"
if not exist "%BASH%" set "BASH=C:\Program Files (x86)\Git\bin\bash.exe"
if not exist "%BASH%" set "BASH=bash"
"%BASH%" "%~dp0deploy.sh" %*
echo.
echo ===========================================
echo  Baigta. Spausk bet koki klavisa uzdaryti.
echo ===========================================
pause >nul
