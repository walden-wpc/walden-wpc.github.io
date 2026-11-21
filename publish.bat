@echo off
REM Walden - one-click publish. Keep this file ASCII-only;
REM all the Chinese output comes from tools/publish.py.
chcp 65001 >nul
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8

python tools\publish.py --interactive

echo.
pause
