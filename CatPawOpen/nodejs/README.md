# CatPawOpen Node.js 服务端与爬虫

本项目为 CatVod / UZN 客户端的嵌入式 Node.js 运行环境与爬虫服务端模板，基于 Fastify 框架开发，采用 ESBuild 进行极速打包，支持开发原生视频采集源（Type 3）与交互式 Web 视频源（Type 7）。

---

## 目录结构

```text
CatPawOpen/nodejs/
├── src/
│   ├── index.js              # 服务启动入口（生命周期 start / stop 管理）
│   ├── dev.js                # 本地独立调试入口
│   ├── router.js             # 路由注册与 /config、/check、/web 转发
│   ├── index.config.js       # 站点数据源配置与主题色彩
│   ├── spider/
│   │   └── video/
│   │       ├── demo.js       # Type 3 原生视频源 Demo 示例
│   │       └── demo_web.js   # Type 7 Web 视频交互源 Demo 示例
│   └── util/                 # 基础网络与数据工具
├── dist/                     # 构建产物输出目录（.gitignore 忽略）
├── pack.js                   # 跨平台本地离线 ZIP 打包脚本
├── esbuild.js                # index.js 构建脚本（输出 CJS + MD5）
├── esbuild-config.js         # index.config.js 构建脚本（输出 CJS + MD5）
└── package.json              # 依赖与脚本配置
```

---

## 快速开始

### 1. 安装依赖

在 `CatPawOpen/nodejs` 目录下安装依赖（推荐 Node.js 18+）：

```bash
npm install
```

### 2. 本地开发与调试

#### 命令行热重载运行
```bash
npm run dev
```
服务将在本地启动并打印监听端口（可通过环境变量 `DEV_HTTP_PORT=3000` 指定端口）：
- 查看站点配置：`http://127.0.0.1:3000/config`
- 健康检查：`http://127.0.0.1:3000/check`
- Web 示例首页预览：`http://127.0.0.1:3000/web`

#### VSCode 断点调试
项目已内置 [`.vscode/launch.json`](.vscode/launch.json)，在 VSCode 中按 `F5` 即可直接启动断点调试。

---

## 构建与本地包打包

### 1. 仅编译 JS 代码
```bash
npm run build
```
编译产物输出至 `dist/` 目录：
- `dist/index.js` 及对应 MD5 校验文件 `dist/index.js.md5`
- `dist/index.config.js` 及对应 MD5 校验文件 `dist/index.config.js.md5`

### 2. 构建本地离线 ZIP 包（推荐）
```bash
npm run pack
```
该命令会自动完成：
1. 编译最新的 `dist/` 产物并计算文件 MD5。
2. 调用 [`pack.js`](pack.js) 将文件严格按照平铺规范压缩为 `dist.zip`。
3. 自动同步输出至：
   - 当前目录：`CatPawOpen/nodejs/dist.zip`
   - 仓库根目录：`catpaw-uzn/dist.zip`
4. 打印生成包的体积大小与整体 MD5 校验和。

---

## 离线包规范与客户端使用

### 1. 压缩包结构规范
生成的 `dist.zip` 内部采用**根文件平铺结构**（不得包含外层多余文件夹）：
```text
dist.zip
├── index.js
├── index.js.md5
├── index.config.js
└── index.config.js.md5
```

### 2. 客户端引用方式
- **本地加载**：将生成的 `dist.zip` 放置于客户端支持的本地路径，客户端直接解压加载。
- **远程托管**：将 `dist.zip` 部署至任意静态 Web 服务，在客户端配置中填入 HTTP/HTTPS 链接与包 MD5。

---

## 爬虫源 Demo 示例说明

项目中包含的示例文件仅作为**开发规范与功能的 Demo 示例**，供开发者参考与二次开发：

### 1. Type 3 原生视频源示例 (`src/spider/video/demo.js`)
演示原生解析爬虫的实现规范：
- 导出 `meta` 配置（`key: 'demo'`, `name: '视频示例'`, `type: 3`）与 `api(fastify)` 路由。
- 实现标准生命周期接口：`home`（分类推荐）、`category`（分页列表）、`detail`（选集详情）、`search`（搜索）、`play`（播放地址解析）。
- `play` 接口返回媒体直链及 Headers，供播放器直接推流。

### 2. Type 7 Web 交互源示例 (`src/spider/video/demo_web.js`)
演示基于 WebView 的富页面交互与客户端通信：
- 导出 `meta` 配置（`key: 'demo_web'`, `name: 'Web视频示例'`, `type: 7`）。
- 注册 `/web` 路由返回完整的自适应流媒体前端页面。
- 演示前端通过原生 Action 协议与客户端双向通信（如唤起原生详情 `openVodDetail`、调用底层播放器 `openVideoPlayer`、触发搜索 `openSearch` 等）。
