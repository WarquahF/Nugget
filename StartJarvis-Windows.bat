@echo off
setlocal
cd /d "%~dp0"
echo Starting Nugget for Windows...

if exist "%~dp0node-portable\node-v24.16.0-win-x64\node.exe" (
  "%~dp0node-portable\node-v24.16.0-win-x64\node.exe" server.js
) else (
  node server.js
)
