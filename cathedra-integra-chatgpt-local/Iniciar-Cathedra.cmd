@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale Node.js 22 ou superior em https://nodejs.org e abra este arquivo novamente.
  pause
  exit /b 1
)
echo Iniciando Cathedra Integra. Mantenha esta janela aberta.
node server.mjs
pause
