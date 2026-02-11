@echo off
setlocal

set PORT=%1
if "%PORT%"=="" set PORT=8080

where php >nul 2>nul
if %errorlevel%==0 (
  echo Starting with PHP on http://localhost:%PORT%
  echo.
  php -S 0.0.0.0:%PORT% serve.php
  goto :EOF
)

where javac >nul 2>nul
if %errorlevel%==0 (
  where java >nul 2>nul
  if %errorlevel%==0 (
    echo Starting with Java on http://localhost:%PORT%
    echo.
    javac StaticServer.java
    if %errorlevel% neq 0 (
      echo Failed to compile StaticServer.java
      goto :ERROR
    )
    java StaticServer %PORT%
    goto :EOF
  )
)

echo Error: Neither PHP nor Java found in PATH.
echo Install PHP or Java, then run start-pos.bat again.

goto :ERROR

:ERROR
echo.
echo Press any key to close...
pause >nul
exit /b 1
