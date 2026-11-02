<script setup lang="ts">
import { provide, ref } from 'vue'
import JsonTreeNode from './JsonTreeNode.vue'
import { foldKey } from './fold'

const props = defineProps({
  // 要渲染的 JSON 数据
  data: { type: null, required: true },
  // 默认展开到的层级，更深的部分初始为折叠；1 表示仅顶层展开
  expandLevel: { type: Number, default: 1 }
})

// 顶层向所有嵌套节点广播"全部展开 / 全部折叠"
const foldSignal = ref(0)
// 当前是否处于"全部展开"状态，同时作为广播目标
const allOpen = ref(false)
provide(foldKey, { signal: foldSignal, target: allOpen })

function toggleAll() {
  allOpen.value = !allOpen.value
  foldSignal.value++
}

const copyState = ref<'idle' | 'ok' | 'fail'>('idle')
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(props.data, null, 2))
    copyState.value = 'ok'
  } catch {
    copyState.value = 'fail'
  } finally {
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => (copyState.value = 'idle'), 1500)
  }
}
</script>

<template>
  <div class="jt-root">
    <div class="jt-toolbar">
      <button class="jt-btn" type="button" @click="toggleAll">
        {{ allOpen ? '全部折叠' : '全部展开' }}
      </button>
      <button class="jt-btn" type="button" @click="copy">
        {{ copyState === 'ok' ? '已复制 ✓' : copyState === 'fail' ? '复制失败' : '复制' }}
      </button>
    </div>
    <div class="jt-body">
      <JsonTreeNode :data="data" :level="1" :expand-level="expandLevel" />
    </div>
  </div>
</template>

<style scoped>
.jt-root {
  position: relative;
  margin: 16px 0;
  padding: 40px 16px 14px;
  border-radius: 8px;
  background-color: var(--vp-code-block-bg);
  overflow-x: auto;
}

.jt-toolbar {
  position: absolute;
  top: 8px;
  right: 10px;
  display: flex;
  gap: 2px;
  z-index: 2;
}

.jt-btn {
  all: unset;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
  color: var(--vp-c-text-3);
  transition: color 0.2s, background-color 0.2s;
}

.jt-btn:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

.jt-btn:focus-visible {
  outline: 1px solid var(--vp-c-brand-1);
}
</style>

<style>
/* 亮/暗双色变量，供 JsonTreeNode 的节点样式引用 */
:root {
  --jt-punct: #24292e;
  --jt-key: #005cc5;
  --jt-string: #032f62;
  --jt-number: #005cc5;
  --jt-bool: #d73a49;
}

.dark {
  --jt-punct: #e1e4e8;
  --jt-key: #79b8ff;
  --jt-string: #9ecbff;
  --jt-number: #79b8ff;
  --jt-bool: #f97583;
}
</style>
