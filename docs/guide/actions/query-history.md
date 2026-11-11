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

返回包含执行状态与历史数据的标准响应对象：

```json
{
    "success": true,
    "message": "success",
    "data": [
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
            "progress_seconds": 350,
            "duration_seconds": 2700,
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
}
```

### 顶层响应字段

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `success` | Boolean | 操作是否成功 / 是否获得用户授权（未授权或存储未就绪时为 `false`） |
| `message` | String | 提示或错误原因（如 `"success"` 或未授权原因，可能为空） |
| `data` | Array | 历史记录项对象数组（未授权或无记录时为 `[]`） |

### data 历史项字段说明

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
| `progress_seconds` | Number | 当前播放进度（已播放秒数，无记录或从头播为 0） |
| `duration_seconds` | Number | 视频总时长（秒数，未知时为 0） |
| `extData` | Object | **客户端生成的完整上下文快照**。站源无需解析其内部字段，后续调用 [openVodDetail](./open-vod-detail.md) 直跳时原样传入即可。 |

