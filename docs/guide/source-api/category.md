<script setup>
const categoryResult = {
    "page": 1,
    "pagecount": 2,
    "list": [
        {
            "vod_id": "113791",
            "vod_name": "斯巴达克斯：亚述家族",
            "vod_pic": "https://image.baidu.com/search/down?url=https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2925299160.jpg",
            "vod_remarks": "更新至02集"
        },
    ],
    "filter": [
        {
            "key": "type",
            "name": "类型",
            "init": "all",
            "value": [
                {
                    "n": "全部",
                    "v": "all"
                },
                {
                    "n": "喜剧",
                    "v": "喜剧"
                }
            ]
        }
    ]
}
</script>

# 分类列表数据 (/category)

> 获取指定分类下的分页视频数据列表，也可以在此接口动态返回当前分类的筛选条件（filter）。

## 请求格式

- **请求路径**：`$api/category`
- **请求方式**：`GET` / `POST`

## 请求参数

| 参数 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `id` | String | 是 | 分类 ID，对应 [/home](./home.md) 接口返回的 `class[i].type_id` |
| `page` | Number | 是 | 当前请求的页码，从 1 开始 |
| `filter` | Boolean | 否 | 是否开启筛选过滤 |
| `filters` | Object / String | 否 | 当前选中的筛选条件键值对，对应 [/home](./home.md) 接口中声明的筛选配置 |

## 返回值说明

返回值示例（点击 ▸ 可逐层展开/收起字段）：

<JsonTree :data="categoryResult" />

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `page` | Number | 当前页码 |
| `pagecount` | Number | 总页数 |
| `limit` | Number | 可选，每页条目数量 |
| `total` | Number | 可选，总条目数 |
| `list` | Array | 视频条目列表 |
| └─ `vod_id` | String | 视频唯一标识符，后续打开详情时传给 [/detail](./detail.md) |
| └─ `vod_name` | String | 视频标题名称 |
| └─ `vod_pic` | String | 视频封面海报图片链接 |
| └─ `vod_remarks` | String | 状态/更新进度/备注信息（如“更新至02集”、“HD”、“已完结”等） |
| `filter` | Array | 可选，针对当前分类动态返回的筛选配置（格式同 `home` 中的筛选规则） |

