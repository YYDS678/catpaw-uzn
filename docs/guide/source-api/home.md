<script setup>
const homeResult = {
    "class": [
        {
            "type_id": "hot_gaia",
            "type_name": "热门内容",
            "type_flag": "1"
        },
        {
            "type_id": "tv_hot",
            "type_name": "热门电视"
        },
    ],
    "filters": {
        "hot_gaia": [
            {
                "key": "sort",
                "name": "排序",
                "init": "recommend",
                "value": [
                    {
                        "n": "热度",
                        "v": "recommend"
                    },
                    {
                        "n": "最新",
                        "v": "time"
                    },
                    {
                        "n": "评分",
                        "v": "rank"
                    }
                ]
            },
        ]
    }
}
</script>

# 首页分类与筛选 (/home)

> 获取站源的分类列表以及各分类下的二级筛选条件（仅普通视频站 `type: 3` 调用；若为 HTML 网页视频站 `type: 7`，首页将转为加载网页，见 [/web 接口](./web.md)）。

## 请求格式

- **请求路径**：`$api/home`
- **请求方式**：`GET` / `POST`

## 请求参数

无请求参数。

## 返回值说明

返回值示例（点击 ▸ 可逐层展开/收起字段）：

<JsonTree :data="homeResult" />

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `class` | Array | 站源的一级分类列表 |
| └─ `type_id` | String | 分类唯一标识符，后续请求 [/category](./category.md) 时作为 `id` 参数传入 |
| └─ `type_name` | String | 分类展示名称 |
| └─ `type_flag` | String | 可选。通常不传；设为 `"1"` 代表目录模式，可用于实现“我的网盘”、“AList”等文件目录浏览功能 |
| `filters` | Object | 各分类下的二级筛选配置，键名为对应的 `type_id`，值为筛选条件数组 |
| └─ `key` | String | 筛选维度的键名（传给 [/category](./category.md) 的 `filters` 对应字段） |
| └─ `name` | String | 筛选维度的中文名称（如“排序”、“地区”、“年份”等） |
| └─ `init` | String | 默认选中的筛选项值（对应 `value[i].v`） |
| └─ `value` | Array | 可选选项列表，每个元素包含 `n`（显示名称）和 `v`（传递的值） |

