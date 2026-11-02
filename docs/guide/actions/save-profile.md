# 保存用户配置 (saveProfile)

> 保存站源或用户的自定义配置数据，由壳子实现跨设备 WebDAV 同步。

## 请求格式

```json
{
    "action": "saveProfile",
    "opt": {
        "cookie1": "value1",
        "cookie2": "value2"
    }
}
```

## 参数说明

`opt` 传入需要持久化的键值对对象：

| 字段 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `[key]` | String / Any | 否 | 自定义配置键与对应的值，壳子将全量或增量保存并通过 WebDAV 漫游 |

