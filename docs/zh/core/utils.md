# 工具函数

`@proseharbor-editor/core` 提供了一小组工具函数，均从包根路径导出。

```ts
import { clamp, prefix, prefixClass, sanitizeHtml, contentStyles } from '@proseharbor-editor/core'
```

## `prefix` / `prefixClass`

```ts
export const prefix = 'proseharbor'
export const prefixClass = 'proseharbor-editor'
```

项目内所有类名都由它们派生，例如 `proseharbor-editor__paragraph`、
`proseharbor-editor-toolbar-menu`。自定义扩展时请使用它们，以保持样式一致：

```ts
import { prefixClass } from '@proseharbor-editor/core'

renderHTML() {
  return ['div', { class: `${prefixClass}__my-node` }, 0]
}
```

## `clamp`

```ts
function clamp(val: number, min: number, max: number): number
```

把数值限制在范围内——`Indent` 用它把缩进限制在 `minIndent` 与 `maxIndent` 之间。

```ts
clamp(12, 0, 7) // 7
```

## `sanitizeHtml`

```ts
interface SanitizeOptions {
  /** 是否内联样式（默认 true） */
  inlineStyles?: boolean
}

function sanitizeHtml(html: string, options: SanitizeOptions = {}): string
```

用于清理编辑器产出的 HTML，方便存储或粘贴到其它地方：

- 移除所有 `proseharbor-editor__*` 类名；
- 移除所有 `data-*` 属性（`<p>` 上的 `data-indent` 会转成 `padding-left: N*2em`）；
- 移除 `id` 属性；
- 按 `contentStyles` 内联样式。

```ts
const clean = sanitizeHtml(editor.getHTML())

// 保留类名而不内联
const clean2 = sanitizeHtml(editor.getHTML(), { inlineStyles: false })
```

::: tip
`sanitizeHtml` 使用 `DOMParser`，只能在浏览器运行。服务端渲染管线可用
Node/cheerio 版本：`@proseharbor-editor/core/src/utils/sanitize-html-node.ts`。
:::

## `contentStyles`

```ts
const contentStyles: Record<string, Record<string, string>>
```

`p`、`h1`–`h6`、`a`、`hr`、`blockquote`、`code`、`pre`、`ul`、`ol`、`li`、
`img`、`table`、`th`、`td` 的样式表，与
`packages/vue3/src/styles/content.scss` 保持一致，`sanitizeHtml` 就是按它内联样式的。

```ts
import { contentStyles } from '@proseharbor-editor/core'

contentStyles.p // { margin: '0.5em 0', … }
```

## 国际化辅助函数

`t`、`te`、`addLocale`、`changeLocale`、`getLocale` 详见[国际化](../guide/i18n)。

## 仅 Vue 3 提供的工具

`@proseharbor-editor/vue3` 还导出了一些工具函数，见
[Vue 3 / 组件](../vue3/components#工具函数)。
