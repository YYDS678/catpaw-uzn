# 查询当前开启的 Tab (queryTabs)

> 查询客户端用户当前在设置中实际开启的主页 Tab 列表（按设置顺序返回）。

## 请求格式

```json
{
    "action": "queryTabs",
    "opt": {}
}
```

## 返回值说明

```json
{
    "tabs": [
        {
            "id": "home",
            "title": "首页",
            "selected": true
        },
        {
            "id": "live",
            "title": "直播",
            "selected": false
        },
        {
            "id": "history",
            "title": "播放历史",
            "selected": false
        },
        {
            "id": "settings",
            "title": "设置",
            "selected": false
        }
    ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `tabs` | Array | 用户已开启的 Tab 列表（按开启顺序排列，关闭的 Tab 不返回） |
| └─ `id` | String | Tab 唯一标识符（如 `home`, `live`, `calendar`, `history`, `search`, `settings`） |
| └─ `title` | String | Tab 中文显示标题 |
| └─ `selected` | Boolean | 当前是否处于激活选中状态 |

