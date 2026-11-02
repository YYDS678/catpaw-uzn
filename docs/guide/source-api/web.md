# HTML 视频站 (/web)

> 仅用于 `type: 7` 的 HTML 网页视频站。壳子首页检测到该站点类型时，会使用内嵌 WebView 直接加载该页面展示。

## 接口规范

- **请求方式**：`GET`
- **默认路径**：`$api/web`（若在 [/config](/guide/config) 的站点元数据中配置了 `homeUrl`，将以配置路径为准）
- **返回内容**：完整的 HTML 页面代码（Content-Type 为 `text/html`）

## 网页与壳子交互流程

1. **渲染主页**：站源在此接口输出自定义的网页（如精选片单、专题等），可在页面内自由排版并引入静态样式/脚本；
2. **点击跳原生详情页**：用户在网页中点击某个视频条目时，推荐向站源自身服务发送请求（如 `fetch('./open?id=123')`），由站源 Fastify 服务端调用 `messageToDart({ action: 'openVodDetail', opt: { vod_id, vod_name, vod_pic } })`；
3. **播放与选集**：壳子接收到指令后自动打开原生视频详情页，并继续调用站源的 [/detail](./detail.md) 与 [/play](./play.md) 接口加载真实播放线路和选集。

## 常用联动 Action

网页视频站通常结合以下原生 Action 协同工作：
- [打开视频详情页 (openVodDetail)](/guide/actions/open-vod-detail.md)：在 App 内部调起原生视频详情页
- [打开视频播放页 (openVideoPlayer)](/guide/actions/open-video-player.md)：直接调起原生播放器起播，支持选集切集与历史记录
- [切换主页 Tab (switchTab)](/guide/actions/switch-tab.md)：切换壳子底栏 Tab
- [跳转原生搜索 (openSearch)](/guide/actions/open-search.md)：调起原生搜索页并预填关键词

