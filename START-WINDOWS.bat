@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js nao foi encontrado. Instale Node.js 22 LTS primeiro.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 ( echo Falha na instalacao. & pause & exit /b 1 )
)
echo Iniciando SF6 Combo Builder...
call npm run dev
pause
