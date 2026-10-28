import { addLocale } from '@proseharbor-editor/core'

import Highlight from './highlight'
import Callout from './callout'
import './icons'

// 菜单标题、tooltip 文案走 i18n，key 就是扩展的 name（t(item.name)）。
// 不注册也能用，只是会直接显示 name 本身。
addLocale('zh', {
  highlight: '高亮',
  callout: '提示块',
})
addLocale('en', {
  highlight: 'Highlight',
  callout: 'Callout',
})

export { Highlight, Callout }
export type { MenuContext } from './types'
export type { CalloutVariant } from './callout'
