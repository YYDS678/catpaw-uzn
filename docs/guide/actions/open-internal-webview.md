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

