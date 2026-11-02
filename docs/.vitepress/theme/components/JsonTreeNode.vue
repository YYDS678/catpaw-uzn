<script setup>
import { computed, inject, ref, watch } from 'vue'
import { foldKey } from './fold'

const props = defineProps({
  // 要渲染的 JSON 数据
  data: { type: null, required: true },
  // 当前嵌套层级（组件内部递归使用）
  level: { type: Number, default: 1 },
  // 默认展开到的层级，更深的部分初始为折叠；1 表示仅顶层展开
  expandLevel: { type: Number, default: 1 }
})

const primitive = v => v === null || typeof v !== 'object'
const isArray = computed(() => Array.isArray(props.data))
const entries = computed(() =>
  isArray.value
    ? props.data.map((v, i) => [String(i), v])
    : Object.entries(props.data)
)

// 响应顶层"全部展开 / 全部折叠"的广播
const fold = inject(foldKey)
// 折叠节点的子节点是展开时才挂载的，挂载可能晚于广播：
// 此时不走默认的 expandLevel 规则，而是继承最近一次广播的目标状态，
// 这样"全部展开"能沿渲染逐层传导到最深处
const open = ref(
  fold && fold.signal.value > 0
    ? fold.target.value
    : props.level <= props.expandLevel
)
if (fold) {
  watch(fold.signal, () => {
    open.value = fold.target.value
  })
}

function typeClass(v) {
  if (v === null) return 'jt-null'
  switch (typeof v) {
    case 'string': return 'jt-string'
    case 'number': return 'jt-number'
    case 'boolean': return 'jt-bool'
    default: return ''
  }
}

function text(v) {
  if (v === null) return 'null'
  if (typeof v === 'string') return JSON.stringify(v)
  return String(v)
}
</script>

<template>
  <span v-if="primitive(data)" class="jt" :class="typeClass(data)">{{ text(data) }}</span>
  <span v-else class="jt">
    <button class="jt-toggle" type="button" :title="open ? '收起' : '展开'" @click="open = !open">
      <span class="jt-arrow" :class="{ 'jt-arrow-open': open }" />
      <span class="jt-punct">{{ isArray ? '[' : '{' }}</span>
    </button>
    <span v-if="!open" class="jt-preview" @click="open = true">…{{ entries.length }}{{ isArray ? ' 项' : ' 个字段' }}</span>
    <span v-else class="jt-children">
      <span v-for="[k, v] in entries" :key="k" class="jt-row">
        <span class="jt-key">{{ isArray ? `${k}:` : `"${k}":` }}</span>
        <JsonTreeNode :data="v" :level="level + 1" :expand-level="expandLevel" />
      </span>
    </span>
    <span class="jt-punct">{{ isArray ? ']' : '}' }}</span>
  </span>
</template>

<style scoped>
.jt {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1.7;
}

.jt-toggle {
  all: unset;
  cursor: pointer;
}

.jt-toggle:focus-visible {
  outline: 1px solid var(--vp-c-brand-1);
}

.jt-arrow {
  display: inline-block;
  width: 1em;
  color: var(--vp-c-text-3);
  text-align: center;
  transition: transform 0.15s;
}

.jt-arrow::before {
  content: '▸';
}

.jt-arrow-open {
  transform: rotate(90deg);
}

.jt-punct {
  color: var(--jt-punct);
}

.jt-preview {
  cursor: pointer;
  margin: 0 4px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.jt-children {
  display: block;
  margin-left: 7px;
  padding-left: 12px;
  border-left: 1px solid var(--vp-c-divider);
}

.jt-row {
  display: block;
}

.jt-key {
  color: var(--jt-key);
}

.jt-string {
  color: var(--jt-string);
  /* 长 URL 自动换行，避免横向溢出 */
  overflow-wrap: anywhere;
}

.jt-number {
  color: var(--jt-number);
}

.jt-bool,
.jt-null {
  color: var(--jt-bool);
}
</style>
