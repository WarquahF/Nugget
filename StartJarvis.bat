@echo off
cd /d "%~dp0front-end"
powershell -ExecutionPolicy Bypass -Command "npm run electron-dev"
pause
