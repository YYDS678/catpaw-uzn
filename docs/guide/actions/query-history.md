# 读取最近观看记录 (queryHistory)

> 读取客户端最近的播放历史记录列表（按播放时间倒序排列）。

## 请求格式

```json
{
    "action": "queryHistory",
    "opt": {
        "count": 10
    }
}
```

## 参数说明

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :---: | :---: | :---: | :--- |
| `count` | Number | 否 | 10 | 获取条数，**最多支持 10 条**（传值大于 10 会被自动限制截断为 10 条） |

## 返回值说明

直接返回历史记录对象数组：

```json
[
    {
        "vod_id": "v_qyn_001",
        "vod_name": "庆余年 第二季",
        "vod_pic": "https://example.com/cover.jpg",
        "vod_remarks": "更新至第28集",
        "vod_year": "2024",
        "episode_name": "第1集",
        "line_from": "官方超清",
        "played_at": 1700000000000,
        "site_key": "site_tencent",
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
]
```

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `vod_id` | String | 视频 ID |
| `vod_name` | String | 视频名称 |
| `vod_pic` | String | 视频封面图海报 URL（可能为空） |
| `vod_remarks`| String | 视频状态或备注（如 `"更新至第28集"`） |
| `vod_year` | String | 视频年份 |
| `episode_name`| String | 最近播放的剧集名称（如 `"第1集"`） |
| `line_from` | String | 最近播放的线路名称（如 `"官方超清"`） |
| `played_at` | Number | 播放时间戳（毫秒） |
| `site_key` | String | 所属站点 Key |
| `extData` | Object | **客户端生成的完整上下文快照**。站源无需解析其内部字段，后续调用 [openVodDetail](./open-vod-detail.md) 直跳时原样传入即可。 |

