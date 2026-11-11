# App 内部打开 Webview (openInternalWebview)

> 站源通知壳子在 App 内部打开指定链接的内置 Webview 浏览器。

## 请求格式

```json
{
    "action": "openInternalWebview",
    "opt": {
        "url": "https://www.baidu.com"
    }
}
```

## 参数说明

| 字段 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `url` | String | 是 | 需要在内置浏览器中打开的目标网页地址 |

## 返回值说明

### 成功时

```json
{
    "success": true
}
```

### 失败时（如缺少 url 或格式非法）

```json
{
    "success": false,
    "message": "URL cannot be empty"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `success` | Boolean | 是否成功拉起内置网页 |
| `message` | String | 错误说明信息（仅失败时返回） |

::: tip 外部浏览器跳转说明
如需调用系统默认外部浏览器打开链接，可使用同源动作 `openExternalWebview`，其参数与返回值格式与本动作完全一致。
:::

