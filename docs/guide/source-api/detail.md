<script setup>
const detailResult = {
    "list": [
        {
            "vod_name": "天书黎明",
            "vod_year": "2025",
            "vod_actor": "演员",
            "vod_director": "导演",
            "vod_content": "介绍",
            "vod_play_from": "夸克-22cfee7efbbb$$$夸克-77ede2577454",
            "vod_play_url": "第一集$id11#第二集$id12$$$第一集$id21#第二集$id22",
            "vod_links": [{
                "name": "百度",
                "url": "https://www.baidu.com"
            }]
        }
    ]
}
</script>

# 视频详情 (/detail)

> 获取视频的完整详细信息，包含上映年份、演员、简介、播放线路以及所有选集列表。

## 请求格式

- **请求路径**：`$api/detail`
- **请求方式**：`GET` / `POST`

## 请求参数

| 参数 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `id` | String / Array | 是 | 视频唯一标识 vodId（可直接传单个 ID，也可以传 ID 数组） |

## 返回值说明

返回值示例（点击 ▸ 可逐层展开/收起字段）：

<JsonTree :data="detailResult" />

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `list` | Array | 详情列表（通常包含单个视频详情对象） |
| └─ `vod_name` | String | 视频名称 |
| └─ `vod_year` | String | 上映年份 |
| └─ `vod_actor` | String | 演员名单 |
| └─ `vod_director` | String | 导演名单 |
| └─ `vod_content` | String | 视频剧情简介 |
| └─ `vod_play_from` | String | 播放线路名称，多个线路以 `$$$` 分隔（如：`夸克-22cfee7efbbb$$$夸克-77ede2577454`） |
| └─ `vod_play_url` | String | 选集信息字符串（格式规范见下文） |
| └─ `vod_links` | Array | 可选，相关外部关联链接列表 `[{ name: "百度", url: "https://www.baidu.com" }]` |

### 选集字符串格式规范 (vod_play_url)

`vod_play_url` 遵循如下层级分隔规范：
1. **线路分隔**：使用 `$$$` 分隔多条线路的选集列表，其顺序和数量必须与 `vod_play_from` 保持一一对应；
2. **剧集分隔**：单条线路内部的所有剧集之间使用 `#` 分隔；
3. **集名与 ID 分隔**：单集内部使用 `$` 分隔为「选集显示名称」和「选集 ID」（例如：`第一集$id11`）。

**完整示例：**
```
第一集$id11#第二集$id12$$$第一集$id21#第二集$id22
```
表示共包含两条线路，每条线路各有两集。

