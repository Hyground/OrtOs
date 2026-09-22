@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0configurar-base-nube.ps1"
if errorlevel 1 (
  echo.
  echo No se modificaron los archivos de entorno.
  pause
  exit /b 1
)
echo.
echo Archivos API\.env y Docker\.env creados correctamente.
pause
