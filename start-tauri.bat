@echo off
setlocal

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js 未安装或未加入 PATH。
  exit /b 1
)

where rustc >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Rust 未安装或未加入 PATH。请先安装 Rustup 并重开终端。
  exit /b 1
)

where cargo >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Cargo 未安装或未加入 PATH。
  exit /b 1
)

echo [STEP] 安装前端依赖...
call npm install
if %errorlevel% neq 0 exit /b 1

echo [STEP] 安装 Tauri CLI...
call npm install -D @tauri-apps/cli
if %errorlevel% neq 0 exit /b 1

echo [STEP] 如果尚未初始化 Tauri，执行：
 echo npx tauri init

echo [STEP] 开发模式启动 Tauri...
call npx tauri dev
