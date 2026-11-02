# Action 列表与规范

::: warning 非猫爪官方声明
本文档为 CatPaw-UZN 接口协议的**非猫爪官方**整理，接口行为可能随壳子版本变化，仅供开发参考。
:::

## 调用机制

壳子提供给源调用的原生交互方法（因壳而异）。站源通过 Node.js 服务端的 `messageToDart({ action, opt })` 发起调用。

```javascript
// Node.js Fastify 服务端发起调用示例
messageToDart({
  action: 'openVodDetail',
  opt: {
    vod_id: '113791',
    vod_name: '视频名称'
  }
});
```



## Action 速查表

| Action 标识 | 中文名称 | 说明 | 文档链接 |
| :--- | :--- | :--- | :--- |
| `openInternalWebview` | 打开内置 Webview | 在 App 内部打开指定 URL 的网页 | [查看详情](./open-internal-webview.md) |
| `saveProfile` | 保存用户配置 | 保存自定义键值对，由壳子实现跨设备 WebDAV 同步 | [查看详情](./save-profile.md) |
| `queryProfile` | 查询用户配置 | 读取用户配置，由壳子实现跨设备 WebDAV 同步 | [查看详情](./query-profile.md) |
| `queryTabs` | 查询当前开启的 Tab | 获取客户端用户当前在设置中实际开启的主页 Tab 列表 | [查看详情](./query-tabs.md) |
| `switchTab` | 切换主页 Tab | 切换客户端主页当前展示的 Tab | [查看详情](./switch-tab.md) |
| `openSearch` | 跳转原生搜索 | 跳转打开客户端原生聚合搜索页并填入关键词 | [查看详情](./open-search.md) |
| `queryHistory` | 读取最近观看记录 | 读取客户端最近的播放历史记录列表（最多 10 条） | [查看详情](./query-history.md) |
| `openVodDetail` | 打开视频详情页 | 打开原生的视频详情页（支持历史直跳与网页新点播） | [查看详情](./open-vod-detail.md) |
| `openVideoPlayer` | 打开视频播放页 | 调起原生播放器起播，支持选集列表、自由切集与自动记录进度 | [查看详情](./open-video-player.md) |

