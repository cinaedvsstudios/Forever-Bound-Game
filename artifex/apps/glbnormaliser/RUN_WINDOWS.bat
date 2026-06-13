@echo off
setlocal
cd /d "%~dp0"
echo.
echo GLB Asset Normaliser
echo --------------------
echo Paste or drag the folder containing your GLB assets, then press Enter.
echo.
set /p GLBROOT=Folder path: 
set "GLBROOT=%GLBROOT:"=%"
if "%GLBROOT%"=="" (
  echo No folder supplied. Using this app folder as the root.
  node server.js
) else (
  node server.js "%GLBROOT%"
)
pause
