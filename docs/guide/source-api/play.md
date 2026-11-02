<script setup>
const playResult = {
    "url": [
        "原画",
        "http://127.0.0.1:9988/spider/duoduo/3/proxy/quark/src/down/a8a313f9fd1e/o%2FK%2FTV2sqZ6rix2WU3iAcDbHD28TjVp1WD4r%2BCVQlvs%3D*e94c887388584cedabcfb9345cfe0829*d9bd312212ad65e844bf8b8132092e66/.bin",
        "超清",
        "http://127.0.0.1:9988/spider/duoduo/3/proxy/quark/trans/4k/a8a313f9fd1e/o%2FK%2FTV2sqZ6rix2WU3iAcDbHD28TjVp1WD4r%2BCVQlvs%3D*e94c887388584cedabcfb9345cfe0829*d9bd312212ad65e844bf8b8132092e66/.mp4"
    ],
    "header": {
        "Cookie": "",
        "User-Agent": "",
    },
    "extra": {
        "danmaku": "弹幕链接",
        "audio": "外挂音轨链接"
    }
}
</script>

# 播放链接 (/play)

> 获取选集的真实播放流链接、请求头信息以及音轨/弹幕等额外播放配置。

## 请求格式

- **请求路径**：`$api/play`
- **请求方式**：`GET` / `POST`

## 请求参数

| 参数 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `flag` | String | 是 | 播放线路标识，对应 [/detail](./detail.md) 返回的 `vod_play_from` 中当前选中的线路 |
| `id` | String | 是 | 选集 ID，对应 [/detail](./detail.md) 返回的 `vod_play_url` 中该集对应的 ID |

## 返回值说明

返回值示例（点击 ▸ 可逐层展开/收起字段）：

<JsonTree :data="playResult" />

### 字段说明

| 字段 | 类型 | 说明 |
| :--- | :---: | :--- |
| `url` | String / Array | 播放地址。支持单个直链 URL 字符串，或清晰度数组（如 `["原画", "http://...", "超清", "http://..."]`） |
| `header` | Object | 可选，播放器请求视频流时需要携带的自定义 HTTP Header（如 `User-Agent`, `Referer`, `Cookie` 等） |
| `extra` | Object | 可选，扩展配置对象 |
| └─ `danmaku` | String | 弹幕地址链接 |
| └─ `audio` | String | 外挂音轨链接 |

