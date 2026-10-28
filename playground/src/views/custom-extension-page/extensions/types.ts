import type { Editor, Range } from '@proseharbor-editor/core'

/**
 * 菜单回调的上下文。
 *
 * - 工具栏 / 气泡菜单：只传 `{ editor }`
 * - 斜杠菜单：额外传 `range`（当前 `/xxx` 文本的范围），插入前必须先删除它，
 *   否则输入的关键字会残留在文档里
 */
export type MenuContext = {
  editor: Editor
  range?: Range
  [key: string]: unknown
}
