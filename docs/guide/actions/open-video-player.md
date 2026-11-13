# 打开视频播放页 (openVideoPlayer)

> 用于站源前端（网页）或 Node.js 服务端直接调起 App 原生全屏视频播放器。支持**普通剧集点播起播**与**历史记录快照直跳**两种模式，起播后原生播放器支持展示完整选集面板、自由切换剧集以及全自动记录播放进度。

## 模式 1：网页剧集点播起播

当站源在自身网页端实现了视频详情与选集列表时，用户点击某一集即可调起原生播放器。壳子将在后台拉取完整选集并拉起播放器：

```json
{
    "action": "openVideoPlayer",
    "opt": {
        "vod_id": "113791",
        "vod_name": "斯巴达克斯：亚述家族",
        "vod_pic": "https://example.com/poster.jpg",
        "episode_name": "第3集",
        "line_from": "官方超清",
        "progress_seconds": 350,
        "key": "tencent",
        "api": "/spider/baseset/0"
    }
}
```

### 入参说明

| 字段 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `vod_id` | String | 是 | 视频在站源内的唯一标识，壳子在后台以此 ID 调用站源 `/detail` 接口拉取选集列表 |
| `vod_name` | String | 否 | 视频名称，用于播放器顶栏、通知栏与锁屏媒体中心展示 |
| `vod_pic` | String | 否 | 封面图海报 URL，用于系统媒体中心展示 |
| `episode_name` | String | 否 | 目标起播集名（如 `"第3集"`）。缺省时自动尝试按历史进度恢复，无历史时默认第 1 集 |
| `line_from` | String | 否 | 目标起播线路名（如 `"官方超清"`）。缺省时自动尝试按历史进度恢复，无历史时默认第 1 条线路 |
| `progress_seconds` | Number | 否 | 指定首次起播位置（单位：秒，非负整数）。传入 `>= 0` 时优先从该位置起播（传 `0` 可强制从头播放）；缺省时按客户端本地历史进度恢复。仅对本次打开的首次起播生效，切集或连播下一集不受影响 |
| `key` | String | 否 | 站点 Key（与 `/config` 返回的 `SiteMeta.key` 严格对齐）。缺省时默认取当前浏览站点 |
| `api` | String | 否 | 站点 API 端点（与 `/config` 返回的 `SiteMeta.api` 严格对齐）。缺省时默认取当前浏览站点 |

::: tip 订阅作用域安全说明
普通点播模式严格绑定在当前站源所在的订阅环境下解析与播放，不支持跨订阅操作。
:::

---

## 模式 2：历史记录快照直跳（一键续播）

通过 [queryHistory](./query-history.md) 接口获取的历史记录中包含完整的 `extData` 快照，直接将该对象作为 `extData` 属性传入即可恢复播放：

```json
{
    "action": "openVideoPlayer",
    "opt": {
        "extData": {
            "sub": "sub_donghua_vip",
            "site": "site_tencent",
            "vodId": "v_qyn_001",
            "api": "/spider/donghua/0",
            "name": "庆余年 第二季",
            "pic": "https://example.com/cover.jpg",
            "rem": "更新至第28集",
            "yr": "2024",
            "ep": "第5集",
            "line": "官方超清",
            "at": 1700000000000
        }
    }
}
```

壳子将通过 `extData` 还原原属订阅、站点、线路与集数，并定位到精准的播放进度恢复播放。若同时在外层显式传入了 `episode_name`、`line_from` 或 `progress_seconds`，则会以显式指定的集数、线路与起始秒数起播。

---

## 出参说明

调用后返回通用的动作执行结果对象：

```json
{
    "success": true
}
```

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `success` | Boolean | 是否成功拉起播放器 |
| `message` | String | 错误提示信息（仅在 `success` 为 `false` 时返回） |

---

## 站源服务端调用示例

```javascript
// 在 Node.js Fastify 服务端调用
messageToDart({
    action: 'openVideoPlayer',
    opt: {
        vod_id: '113791',
        vod_name: '斯巴达克斯：亚述家族',
        vod_pic: 'https://example.com/poster.jpg',
        episode_name: '第3集',
        line_from: '官方超清'
    }
});
```
