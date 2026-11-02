import type { InjectionKey, Ref } from 'vue'

/** JsonTree 顶层向所有嵌套节点广播"全部展开 / 全部折叠"的上下文 */
export interface FoldContext {
  /** 每次广播时递增的信号 */
  signal: Ref<number>
  /** true 表示目标状态为全部展开 */
  target: Ref<boolean>
}

export const foldKey: InjectionKey<FoldContext> = Symbol('json-tree-fold')
