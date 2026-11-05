# CatPawOpen

CatPawOpen 是针对 CatVod / UZN 生态的开放式扩展与服务组件集合。

---

## 模块说明

- **[nodejs/](nodejs/README.md)**：基于 Fastify 与 ESBuild 构建的 Node.js 运行时服务与爬虫源模块。
  - 内置 **Type 3 原生采集源**与 **Type 7 Web 视频源**的标准 Demo 示例。
  - 内置极速跨平台本地离线 ZIP 打包脚本（`npm run pack`）。

---

## 快速打包指南

进入 `CatPawOpen/nodejs` 目录后执行：

```bash
# 1. 安装依赖
npm install

# 2. 一键编译并打包本地离线包
npm run pack
```

打包成功后产出 `dist.zip`，可直接供给 UZN 客户端使用。更多开发与调试说明请查阅 [Node.js 模块文档](nodejs/README.md)。
