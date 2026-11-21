@echo off
REM Walden - one-click publish. Keep this file ASCII-only;
REM all the Chinese output comes from tools/publish.py.
chcp 65001 >nul
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8

python tools\publish.py
if errorlevel 1 (
  echo.
  pause
  exit /b 1
)

echo.
set /p ANS="Publish to GitHub now? (y/N): "
if /i "%ANS%"=="y" (
  python tools\publish.py --push
) else (
  echo Nothing pushed.
)
echo.
pause
