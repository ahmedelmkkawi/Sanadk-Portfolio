@echo off
REM Run both backend and frontend servers for the Sanadak Portfolio project.
setlocal
pushd "%~dp0"

echo Starting backend server...
start "Backend" powershell -NoExit -Command "Set-Location '%~dp0backend'; npm run start:dev"

echo Starting frontend server...
start "Frontend" powershell -NoExit -Command "Set-Location '%~dp0frontend'; npm run start:user"

start "Frontend" powershell -NoExit -Command "Set-Location '%~dp0frontend'; npm run start:admin"

echo Project startup commands launched.
endlocal
