@echo off
setlocal
cd /d "%~dp0"

set "CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist "%CSC%" set "CSC=C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"

if not exist "%CSC%" (
  echo ERROR: C# compiler was not found.
  exit /b 1
)

"%CSC%" /nologo /target:winexe /optimize+ /reference:System.dll /reference:System.Windows.Forms.dll /out:"..\Run Rusukh Production.exe" "RusukhLauncher.cs"
if errorlevel 1 exit /b 1

echo Created: ..\Run Rusukh Production.exe
endlocal
