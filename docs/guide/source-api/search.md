<script setup>
const searchResult = {
    "page": 1,
    "pagecount": 1,
    "list": [
        {
            "vod_id": "/index.php/vod/detail/id/28.html",
            "vod_name": "仙逆",
            "vod_pic": "https://hhmage.com/cover/896b690b9566f53a875e03a3a324c091.jpg",
            "vod_remarks": "更新至118集"
        },
        {
            "vod_id": "/index.php/vod/detail/id/8311.html",
            "vod_name": "仙逆剧场版 神临之战",
            "vod_pic": "https://hhmage.com/cover/841e0cb6a6dd09486f7be20d9b476e17.jpg",
            "vod_remarks": "已完结"
        }
    ]
}
</script>

# 搜索 (/search)

> 关键词搜索视频接口，客户端原生聚合搜索或搜索页发起查询时调用。

## 请求格式

- **请求路径**：`$api/search`
- **请求方式**：`GET` / `POST`

## 请求参数

| 参数 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `wd` | String | 是 | 搜索关键字 |
| `page` | Number | 否 | 页码，默认从 1 开始 |

## 返回值说明

返回值示例（点击 ▸ 可逐层展开/收起字段）：

<JsonTree :data="searchResult" />

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `page` | Number | 当前页码 |
| `pagecount` | Number | 总页数 |
| `list` | Array | 搜索结果条目列表 |
| └─ `vod_id` | String | 视频唯一标识符，后续打开详情时传给 [/detail](./detail.md) |
| └─ `vod_name` | String | 视频名称 |
| └─ `vod_pic` | String | 封面海报图片链接 |
| └─ `vod_remarks` | String | 更新进度或备注信息（如“更新至118集”、“已完结”） |

