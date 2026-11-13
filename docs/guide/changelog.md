# 变更记录

本文档记录 CatPaw-UZN 协议规范、文档内容以及示例工程的更新与演进历史。

---

## 2026-11-13

### 功能增强：openVideoPlayer 支持指定起播位置
- **入参字段扩充**：`openVideoPlayer` 新增可选参数 `progress_seconds`（非负整数，单位：秒），同时支持普通点播模式与 `extData` 快照直跳模式的外层显式覆盖；
- **一次性首播语义**：传入 `>= 0` 时仅对本次打开的首次起播生效（传 `0` 可强制从头播放），缺省按客户端本地历史进度恢复，切集或连播下一集自动失效；
- **文档同步更新**：更新 `docs/guide/actions/open-video-player.md`，补充 `progress_seconds` 入参示例、字段说明与 `extData` 覆盖规则。

### 示例更新：Type 7 Web 交互源 (demo_web)
- **指定时间起播测试**：在 `demo_web.js` 视频卡片操作栏新增 `⏱ 1:58` 快捷按钮（调用 `openVideoPlayer` 并传入 `progress_seconds: 118`），同步支持 `/play-action` 透传及 `/test` 端点校验；
- **打包产物同步**：重新执行 `npm run pack` 打包生成最新 `dist.zip` 与 MD5 校验和。

---

## 2026-11-11

### 规范重构：统一 Action 响应封套格式
- **统一响应封套 (`{ success, message, data }`)**：
  - 为支持用户隐私授权拦截、统一异常感知与跨端强类型契约，规范所有通用交互 Action 的出参结构；
  - 改造 Action 包括：`queryTabs`、`switchTab`、`openInternalWebview`、`openVodDetail`，出参统一包装为 `success`（布尔值）、`message`（提示信息或错误原因）及 `data`（核心数据负载）；
  - `saveProfile` 与 `queryProfile` 保持底层 Key-Value 直读直存特性不变。
- **文档全面同步**：
  - 更新 `query-tabs.md`、`switch-tab.md`、`open-internal-webview.md`、`open-vod-detail.md` 等对应接口的出参说明与 JSON 示例。

### 功能增强：queryHistory 播放进度扩展
- **出参字段扩充**：`queryHistory` 每个历史记录项新增返回 `progress_seconds`（当前播放进度秒数）与 `duration_seconds`（视频总时长秒数）；
- **跨站与多源共享**：支持 TMDB 跨源跨站播放进度精准对齐与本地播放进度回显；
- **文档同步更新**：更新 `docs/guide/actions/query-history.md`，补充封套契约定义、字段说明以及敏感授权场景应对说明。

### 示例更新：Type 7 Web 交互源 (demo_web)
- **封套适配与授权感知**：`extractHistoryList` 健壮解析规范封套，感知 `success: false` 未授权场景；`handleAction` 支持透明透传客户端标准封套结果；
- **UI 播放进度条呈现**：在最近在看卡片中渲染进度条（Progress Bar）及进度百分比（如 `已看 35%` 或 `已看完`），并提供时间格式化计算（`formatDuration`）；
- **打包产物同步**：更新 Node.js 爬虫源码并重新执行 `npm run build` 和 `npm run pack`，同步生成最新 `dist.zip` 与 MD5 校验和。

---

## 2026-11-05

### 示例工程：引入 CatPawOpen Node.js 服务端工程
- **Node.js 爬虫框架搭建**：新增 `CatPawOpen/nodejs` 模块，基于 Fastify 框架构建，支持热重载开发与极速构建；
- **双模 Demo 示例**：
  - **Type 3 原生视频源 (`demo.js`)**：完整实现 `/init`、`/home`、`/category`、`/detail`、`/play`、`/search` 等生命周期方法；
  - **Type 7 Web 视频交互源 (`demo_web.js`)**：提供移动端自适应响应式流媒体前端与双向 Action 原生通信；
- **打包与离线包工作流**：引入 ESBuild 脚本，支持输出 CJS 格式产物与 MD5 校验文件，提供 `npm run pack` 脚本自动打包根文件平铺规范的 `dist.zip` 离线压缩包。

---

## 2026-11-02

### 项目初始发布 (Initial Release)
- **协议文档库创建**：基于 VitePress 搭建 CatPaw-UZN 服务说明文档系统；
- **猫源协议框架**：
  - 梳理猫源运行机制与架构概览；
  - 详细定义 `/config` 配置协议规范（站点定义、源类型、接口前缀、全局弹幕/搜索配置）；
- **站源标准接口体系**：完成 7 个核心接口的规范文档（`/init`、`/home`、`/category`、`/detail`、`/play`、`/search`、`/web`）；
- **初代 Action 交互体系**：梳理站源向客户端发起的扩展 Action 契约（`openVodDetail`、`openVideoPlayer`、`openSearch`、`queryHistory`、`saveProfile`、`queryProfile`、`queryTabs`、`switchTab`、`openInternalWebview`）；
- **自动化部署**：配置 GitHub Actions 工作流（`.github/workflows/deploy.yml`），支持全量拉取提交历史并自动发布至 GitHub Pages。
