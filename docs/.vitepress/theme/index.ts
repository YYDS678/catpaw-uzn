import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import JsonTree from './components/JsonTree.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册为全局组件，任意 Markdown 页面可直接写 <JsonTree :data="xxx" />
    app.component('JsonTree', JsonTree)
  }
} satisfies Theme
