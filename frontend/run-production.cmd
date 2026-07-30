@echo off
cd /d "%~dp0"
title Rusukh - Real Estate Development Platform

if not defined DATABASE_URL set DATABASE_URL=file:./dev.db
if not defined DOCUMENT_STORAGE_PATH set DOCUMENT_STORAGE_PATH=./storage
if not defined PORT set PORT=3100
if not defined HOSTNAME set HOSTNAME=127.0.0.1

echo Starting Rusukh Real Estate Development Platform...
echo Listening on http://127.0.0.1:3100
echo.

node scripts\run-production.js

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Server stopped with error code %ERRORLEVEL%.
  pause
)
