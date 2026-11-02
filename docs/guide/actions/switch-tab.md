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
    "current": "settings"
}
```

### 失败时（如目标 Tab 未开启或不存在）

```json
{
    "success": false,
    "current": "home",
    "message": "Tab not found or not enabled"
}
```

