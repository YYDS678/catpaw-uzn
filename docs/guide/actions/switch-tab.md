# 切换主页 Tab (switchTab)

> 切换客户端主页当前展示的 Tab。

## 请求格式

```json
{
    "action": "switchTab",
    "opt": {
        "id": "settings"
    }
}
```

## 参数说明

| 字段 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `id` | String | 是 | 目标 Tab 标识（严格对应 `queryTabs` 返回的 `id`） |

## 返回值说明

### 成功时

```json
{
    "success": true,
    "data": {
        "current": "settings"
    }
}
```

### 失败时（如目标 Tab 未开启或不存在）

```json
{
    "success": false,
    "message": "Tab not found or not enabled"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `success` | Boolean | 是否切换成功 |
| `message` | String | 错误说明信息（仅失败时返回） |
| `data` | Object | 切换结果数据（仅成功时返回） |
| └─ `current` | String | 当前激活生效的 Tab ID |

