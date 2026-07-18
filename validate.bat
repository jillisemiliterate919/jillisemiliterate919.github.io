@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>&1
if %errorlevel%==0 (
  py -3 tools\build.py --validate-only || exit /b 1
  py -3 tools\check_site.py
  goto :done
)

where python >nul 2>&1
if %errorlevel%==0 (
  python tools\build.py --validate-only || exit /b 1
  python tools\check_site.py
  goto :done
)

echo ERROR: Python 3 was not found in PATH.
exit /b 1

:done
if errorlevel 1 exit /b %errorlevel%
echo.
echo Validation completed.
pause
