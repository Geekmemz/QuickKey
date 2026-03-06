@echo off
setlocal

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js 未安装或未加入 PATH。请先安装 Node.js 20+。
  exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] npm 未安装或未加入 PATH。
  exit /b 1
)

echo [STEP] 安装依赖...
call npm install
if %errorlevel% neq 0 exit /b 1

echo [STEP] 启动开发服务...
call npm run dev
