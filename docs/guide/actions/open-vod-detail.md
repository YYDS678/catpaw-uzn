# 打开视频详情页 (openVodDetail)

> 用于站源网页（HTML 视频站）或爬虫脚本通知壳子打开原生的视频详情页（含选集、播放线路与弹幕）。支持**历史记录直跳**与**普通网页点播**两种模式。

## 模式 1：历史记录直跳（推荐）

通过 [queryHistory](./query-history.md) 接口获取的播放记录中包含完整的 `extData` 快照，直接将该对象作为 `extData` 属性传入即可：

```json
{
    "action": "openVodDetail",
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
            "ep": "第1集",
            "line": "官方超清",
            "at": 1700000000000
        }
    }
}
```

壳子将通过 `extData` 直接还原该视频原属的订阅、站点与视频详情，实现无缝秒开。

---

## 模式 2：网页新视频点播

站源网页内部点击新视频时调用，支持传入视频基础信息以及站点定位参数（与 `/config` 的 `SiteMeta` 字段严格一致）：

```json
{
    "action": "openVodDetail",
    "opt": {
        "vod_id": "113791",
        "vod_name": "斯巴达克斯：亚述家族",
        "vod_pic": "https://example.com/poster.jpg",
        "key": "tencent",
        "api": "/spider/baseset/0"
    }
}
```

### 参数说明

| 字段 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `vod_id` | String | 是 | 视频在站源内的唯一标识，壳子进入详情页后将以此 ID 调用站源的 `/detail` 接口 |
| `vod_name` | String | 否 | 视频名称，用于详情页过渡与标题占位 |
| `vod_pic` | String | 否 | 视频封面图海报 URL |
| `key` | String | 否 | 站点 Key（与 `/config` 返回的 `SiteMeta.key` 严格对齐）。缺省时默认取当前浏览站点；传值时将在当前订阅内智能匹配对应站点的 `api` |
| `api` | String | 否 | 站点 API 端点（与 `/config` 返回的 `SiteMeta.api` 严格对齐）。缺省时默认取当前浏览站点；传值时智能匹配对应站点的 `key` |

::: tip 订阅作用域安全说明
普通点播模式严格绑定在当前站源所在的订阅环境下跳转，不允许且不支持跨订阅操作。
:::

## 返回值说明

```json
{
    "success": true
}
```

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `success` | Boolean | 是否成功拉起视频详情页 |
| `message` | String | 错误提示信息（仅在 `success` 为 `false` 时返回） |

---

## 站源服务端调用示例

```javascript
// 在 Node.js Fastify 服务端调用
messageToDart({
    action: 'openVodDetail',
    opt: {
        vod_id: '113791',
        vod_name: '斯巴达克斯：亚述家族',
        vod_pic: 'https://example.com/poster.jpg'
    }
});
```
