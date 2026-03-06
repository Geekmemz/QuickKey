# QuickKey

QuickKey 是一个本地离线密码生成器，目标体验对齐 1Password 与 Bitwarden 的生成器。

## 已实现功能

- 生成模式：密码、密码短语、用户名、PIN
- 密码高级选项：长度、字符集、最少数字、最少符号、排除易混淆字符
- 密码短语选项：单词数、分隔符、首字母大写、包含数字
- 用户名选项：随机单词/形容词+名词/姓名风格、首字母大写、包含数字
- 强度评分（密码模式）
- 历史记录（本地持久化）
- 一键复制、一键刷新
- 蓝白卡片风格 UI（移动端自适应）

## 直接使用（已打包）

- 安装包：`src-tauri/target/release/bundle/nsis/QuickKey_0.1.0_x64-setup.exe`
- MSI：`src-tauri/target/release/bundle/msi/QuickKey_0.1.0_x64_en-US.msi`
- 便携可执行：`src-tauri/target/release/app.exe`

最终用户电脑不需要 Node、Rust 或开发环境。

## 开发构建（仅开发者需要）

- `npm install`
- `npm run build`
- `npx tauri build`

## 目录

- `src/App.tsx`: 主界面与交互
- `src/lib/generator.ts`: 生成算法与强度评分
- `src/lib/storage.ts`: 本地持久化
- `src/styles.css`: UI 样式
- `src-tauri/tauri.conf.json`: 桌面打包配置
