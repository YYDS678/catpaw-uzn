<script setup>
const configExample = {
  "video": {
    "sites": [
      {
        "key": "nodejs_douban",
        "name": "🐵豆瓣‍|首页🐵",
        "type": 3,
        "indexs": 1,
        "searchable": 1,
        "api": "/spider/douban/3"
      },
      {
        "key": "nodejs_my_web",
        "name": "精选片单(网页)",
        "type": 7,
        "homeUrl": "/web",
        "searchable": 0,
        "api": "/spider/my_web/7"
      },
      {
        "key": "nodejs_push",
        "name": "推送",
        "type": 4,
        "api": "/spider/push/4"
      }
    ],
    "danmuSearchUrl": "http://127.0.0.1:2333/website/danmu/fe",
    "homePageUrl": "",
    "searchSuggestionUrl": "http://127.0.0.1:2333/search/suggestion"
  }
}
</script>

# 配置 /config

::: warning 非猫爪官方声明
本文档为 CatPaw-UZN 接口协议的**非猫爪官方**整理，接口行为可能随壳子版本变化，仅供开发参考。
:::

## 接口说明

- **请求路径**：`/config`
- **请求方式**：`GET`
- **调用时机**：壳子客户端在启动服务、载入或切换订阅源时最先调用的全局配置接口，用于发现站源中包含的内容分类与站点元数据列表。

## 配置返回示例

返回值示例（点击 ▸ 可逐层展开/收起字段）：

<JsonTree :data="configExample" />

完整 JSON 格式参考：

```json
{
  "video": {
    "sites": [
      {
        "key": "nodejs_douban",
        "name": "🐵豆瓣‍|首页🐵",
        "type": 3,
        "indexs": 1,
        "searchable": 1,
        "api": "/spider/douban/3"
      },
      {
        "key": "nodejs_my_web",
        "name": "精选片单(网页)",
        "type": 7,
        "homeUrl": "/web",
        "searchable": 0,
        "api": "/spider/my_web/7"
      },
      {
        "key": "nodejs_push",
        "name": "推送",
        "type": 4,
        "api": "/spider/push/4"
      }
    ],
    "danmuSearchUrl": "http://127.0.0.1:2333/website/danmu/fe",
    "homePageUrl": "",
    "searchSuggestionUrl": "http://127.0.0.1:2333/search/suggestion"
  }
}
```

---

## 根对象字段说明

| 字段 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `video` | Object | 是 | 影视/视频站点分类目录配置（核心） |

---

## 视频分类目录说明 (SiteCategory)

`video` 分类对象下支持配置以下字段：

| 字段 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `sites` | Array | 是 | 该分类下挂载的站点列表，每项为站点的元信息对象（`SiteMeta`） |
| `danmuSearchUrl` | String | 否 | 订阅源附带的弹幕服务/搜索页地址（如 `http://127.0.0.1:2333/website/danmu/fe`） |
| `homePageUrl` | String | 否 | 站源服务管理或网页配置地址（默认通常为 `http://xxx:xxx/website`） |
| `searchSuggestionUrl` | String | 否 | 搜索联想建议接口地址，详细协议见 [searchSuggestionUrl 说明](#searchsuggestionurl) |

---

## 站点元数据字段说明 (SiteMeta)

`sites` 数组中的每个站点对象用于声明一个独立的爬虫源或网页源：

| 字段 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `key` | String | 是 | 站点全局唯一标识 Key（如 `nodejs_douban`），壳子据此记录历史、收藏与精准路由寻址 |
| `name` | String | 是 | 站点在客户端界面展示的名称（如 `豆瓣|首页`） |
| `type` | Number | 是 | 站点类型标识，决定客户端渲染方式与协议规范，见下文 [站点类型枚举](#站点类型-type-枚举) |
| `api` | String | 是 | 站源业务接口路由前缀（如 `/spider/douban/3`），后续所有接口（如 `/home`）均挂载在此路径下 |
| `searchable` | Number | 否 | 是否允许参与客户端全局聚合搜索。`1` 代表允许，`0` 代表禁止，缺省默认允许 |
| `indexs` | Number | 否 | 是否启用快速跳搜索模式。缺省或为 `0` 代表普通详情；为 `1` 代表点击条目后不进详情页，而是直接将标题填入搜索框触发聚合搜索（常见于豆瓣等片单推荐站） |
| `homeUrl` | String | 否 | 仅在 `type: 7`（HTML 网页视频站）时生效。指定自定义主页加载地址或相对路径，缺省默认使用 `$api/web` |

### 站点类型 (type) 枚举

客户端通过 `type` 字段识别站源类型并分流进入对应的展示视图：

| 类型值 | 分类 | 说明 |
| :--- | :--- | :--- |
| **`3`** | 普通视频源 | 最常见的标准爬虫视频站，通过 `/home`、`/category`、`/detail` 等接口提供数据 |
| **`4`** | 直链推送源 | 直链或本地链接推送站，点击后直接唤起播放器推流 |
| **`7`** | HTML 网页视频源 | 内嵌网页展示的主页（WebView），通过原生 Action 触发详情跳转与播放 |

---

## searchSuggestionUrl

> 搜索联想建议 API，可选。用户在客户端搜索框输入关键词时，客户端向该接口发送防抖请求，用于展示下拉推荐词条。

### 请求规范

- **请求方式**：`GET`
- **请求格式**：`{searchSuggestionUrl}?wd={关键字}`

| 参数 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `wd` | String | 是 | 用户当前在搜索框中输入的关键词 |

### 返回值规范

返回裸 JSON 数组，每一项为一条建议词条对象：

```json
[
  {
    "vod_name": "仙逆",
    "vod_pic": "https://example.com/poster.jpg"
  },
  {
    "vod_name": "仙逆剧场版 神临之战"
  }
]
```

| 字段 | 类型 | 必填 | 说明 |
| :--- | :---: | :---: | :--- |
| `vod_name` | String | 是 | 联想建议词条标题，用户点击后将自动填入搜索框并立即发起聚合搜索 |
| `vod_pic` | String | 否 | 海报图片链接。若提供，搜索框下拉列表将显示为图文建议项 |
