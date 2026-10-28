# Utils

`@proseharbor-editor/core` ships a small set of helpers, all re-exported from
the package root.

```ts
import { clamp, prefix, prefixClass, sanitizeHtml, contentStyles } from '@proseharbor-editor/core'
```

## `prefix` / `prefixClass`

```ts
export const prefix = 'proseharbor'
export const prefixClass = 'proseharbor-editor'
```

Every class name in the project is derived from them, e.g.
`proseharbor-editor__paragraph`, `proseharbor-editor-toolbar-menu`. Use them
when you write your own extension styles so your markup stays consistent:

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

Clamps a number into a range — used by `Indent` to keep the indentation between
`minIndent` and `maxIndent`.

```ts
clamp(12, 0, 7) // 7
```

## `sanitizeHtml`

```ts
interface SanitizeOptions {
  /** Inline styles instead of classes (default true) */
  inlineStyles?: boolean
}

function sanitizeHtml(html: string, options: SanitizeOptions = {}): string
```

Cleans up HTML produced by the editor so it can be stored or pasted elsewhere:

- removes every `proseharbor-editor__*` class,
- removes all `data-*` attributes (`data-indent` on `<p>` becomes
  `padding-left: N*2em`),
- removes `id` attributes,
- inlines the styles declared in `contentStyles`.

```ts
const clean = sanitizeHtml(editor.getHTML())

// keep class names instead of inlining
const clean2 = sanitizeHtml(editor.getHTML(), { inlineStyles: false })
```

::: tip
`sanitizeHtml` uses `DOMParser`, so it runs in the browser. A Node/cheerio
version exists at `@proseharbor-editor/core/src/utils/sanitize-html-node.ts` for
server side rendering pipelines.
:::

## `contentStyles`

```ts
const contentStyles: Record<string, Record<string, string>>
```

A style map for `p`, `h1`–`h6`, `a`, `hr`, `blockquote`, `code`, `pre`, `ul`,
`ol`, `li`, `img`, `table`, `th`, `td`. It mirrors
`packages/vue3/src/styles/content.scss` and is what `sanitizeHtml` inlines.

```ts
import { contentStyles } from '@proseharbor-editor/core'

contentStyles.p // { margin: '0.5em 0', … }
```

## Locale helpers

`t`, `te`, `addLocale`, `changeLocale` and `getLocale` are documented in
[Internationalization](../guide/i18n).

## Vue 3 only helpers

`@proseharbor-editor/vue3` re-exports a few more utilities — see
[Vue 3 / Components](../vue3/components#utilities).
