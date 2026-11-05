# catpaw-uzn

CatPaw UZN 文档体系与服务端运行组件仓库。

---

## 仓库结构

```text
catpaw-uzn/
├── docs/                 # VitePress 文档中心（UZN 规范、Source API、Action 协议等）
├── CatPawOpen/           # 运行时服务组件工程
│   └── nodejs/           # 基于 Fastify 的 Node.js 爬虫服务端
│       ├── src/spider/   # 爬虫示例（Type 3 原生 / Type 7 Web Demo）
│       └── pack.js       # 本地离线 ZIP 打包脚本
├── dist.zip              # 由打包脚本自动生成的最新本地离线包（.gitignore 已忽略）
└── package.json          # 根目录便捷执行脚本
```

---

## 常用操作指南

### 1. 文档开发与预览 (VitePress)

```bash
# 启动本地文档开发服务器
npm run dev

# 构建静态文档
npm run build
```

---

### 2. Node.js 爬虫服务构建与打包本地离线包

仓库内置了针对 `CatPawOpen/nodejs` 的便捷构建与打包脚本，可以在根目录直接运行：

```bash
# 进入 nodejs 目录安装依赖（首次运行需执行）
cd CatPawOpen/nodejs && npm install && cd ../..

# 一键打包本地离线 ZIP 包（推荐）
npm run pack:nodejs
```

> **提示**：运行 `npm run pack:nodejs` 后，将自动编译并将合规的 `dist.zip` 产出并同步至仓库根目录 `catpaw-uzn/dist.zip`。

---

## 详细模块说明

- [CatPawOpen 模块说明](file:///Users/z/Documents/MyGit/catpaw-uzn/CatPawOpen/README.md)
- [Node.js 爬虫服务端开发与构建指南](file:///Users/z/Documents/MyGit/catpaw-uzn/CatPawOpen/nodejs/README.md)
