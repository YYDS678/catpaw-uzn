import { defineConfig } from 'vitepress'

// 站点配置：https://vitepress.dev/zh/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: 'CatPaw 服务说明',
  description: 'CatPaw 服务说明文档',

  // GitHub Pages 项目站点部署在 <用户名>.github.io/<仓库名>/ 子路径下，
  // 因此 base 需要写成 /仓库名/。若将来部署到独立的 username.github.io 根域名，改为 '/'。
  base: '/catpaw-uzn/',

  // 在页面底部显示"最后更新于"（依赖 git 提交历史，CI 中需完整拉取仓库）
  lastUpdated: true,

  themeConfig: {
    // 顶部导航
    nav: [
      { text: '文档', link: '/guide/overview' },
      { text: '站源接口', link: '/guide/source-api/' },
      { text: 'Action 列表', link: '/guide/actions/' },
      { text: '变更记录', link: '/guide/changelog' }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '猫源协议',
          items: [
            { text: '协议概述', link: '/guide/overview' },
            { text: '配置 /config', link: '/guide/config' },
            {
              text: '站源接口',
              collapsed: false,
              items: [
                { text: '接口概述与速查', link: '/guide/source-api/' },
                { text: '初始化 (/init)', link: '/guide/source-api/init' },
                { text: '首页分类 (/home)', link: '/guide/source-api/home' },
                { text: '分类列表 (/category)', link: '/guide/source-api/category' },
                { text: '视频详情 (/detail)', link: '/guide/source-api/detail' },
                { text: '播放链接 (/play)', link: '/guide/source-api/play' },
                { text: '搜索 (/search)', link: '/guide/source-api/search' },
                { text: 'HTML 视频站 (/web)', link: '/guide/source-api/web' }
              ]
            },
            {
              text: 'Action 列表',
              collapsed: false,
              items: [
                { text: 'Action 概述与速查', link: '/guide/actions/' },
                { text: '打开内置 Webview (openInternalWebview)', link: '/guide/actions/open-internal-webview' },
                { text: '保存用户配置 (saveProfile)', link: '/guide/actions/save-profile' },
                { text: '查询用户配置 (queryProfile)', link: '/guide/actions/query-profile' },
                { text: '查询开启的 Tab (queryTabs)', link: '/guide/actions/query-tabs' },
                { text: '切换主页 Tab (switchTab)', link: '/guide/actions/switch-tab' },
                { text: '跳转原生搜索 (openSearch)', link: '/guide/actions/open-search' },
                { text: '读取最近观看记录 (queryHistory)', link: '/guide/actions/query-history' },
                { text: '打开视频详情页 (openVodDetail)', link: '/guide/actions/open-vod-detail' },
                { text: '打开视频播放页 (openVideoPlayer)', link: '/guide/actions/open-video-player' }
              ]
            },
            { text: '变更记录', link: '/guide/changelog' }
          ]
        }
      ]
    },

    // 站内搜索（本地构建索引，无需第三方服务）
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/YYDS678/catpaw-uzn' }
    ],

    // 右侧本页目录
    outline: { level: [2, 3], label: '本页目录' },

    // 界面文案汉化
    lastUpdated: { text: '最后更新于' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})
