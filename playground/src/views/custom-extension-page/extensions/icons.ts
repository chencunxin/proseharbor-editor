import { addIcon } from '@iconify/vue'

/**
 * 菜单里的图标由内置组件 IIcon 渲染，它固定解析成
 * `proseharbor-editor:{kebab-case 的 name}`，例如：
 * - name = 'highlight' -> proseharbor-editor:highlight
 * - name = 'myHighlight' -> proseharbor-editor:my-highlight
 *
 * 内置图标集里没有自定义扩展的图标，所以要用 addIcon / addCollection
 * 往同一个前缀里注册（图标必须是 24x24 的 SVG body）。
 */
export const ICON_PREFIX = 'proseharbor-editor'

addIcon(`${ICON_PREFIX}:highlight`, {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 11 6-6 3 3-6 6H9zM5 15l4-4"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M3 21h18"/>',
  width: 24,
  height: 24,
})

addIcon(`${ICON_PREFIX}:callout`, {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5h16v14H4zM8 9h8M8 13h5"/>',
  width: 24,
  height: 24,
})
