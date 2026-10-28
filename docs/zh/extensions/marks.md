# 标记扩展

标记为文本添加行内格式。多数是官方 Tiptap 标记的薄封装，并补充了菜单元信息
（`command`、`isActive`、`isDisabled`、`shortcutkeys`）。

## Bold

```ts
import { Bold } from '@proseharbor-editor/core'
```

| 选项           | 默认值              |
| -------------- | ------------------- |
| `name`         | `'bold'`            |
| `desc`         | `'**proseharbor**'` |
| `shortcutkeys` | `'Mod-B'`           |

命令：`toggleBold()`。

```ts
editor.chain().focus().toggleBold().run()
```

## Italic

| 选项           | 默认值            |
| -------------- | ----------------- |
| `name`         | `'italic'`        |
| `desc`         | `'*proseharbor*'` |
| `shortcutkeys` | `'Mod-I'`         |

命令：`toggleItalic()`。

## Underline

| 选项           | 默认值        |
| -------------- | ------------- |
| `name`         | `'underline'` |
| `shortcutkeys` | `'Mod-U'`     |

命令：`toggleUnderline()`。

## Strike

| 选项           | 默认值              |
| -------------- | ------------------- |
| `name`         | `'strike'`          |
| `desc`         | `'~~proseharbor~~'` |
| `shortcutkeys` | `'Mod-Shift-S'`     |

命令：`toggleStrike()`。

## Code

| 选项             | 默认值                                  |
| ---------------- | --------------------------------------- |
| `exitable`       | `true`                                  |
| `HTMLAttributes` | `{ class: 'proseharbor-editor__code' }` |
| `desc`           | ``'`proseharbor`'``                     |
| `shortcutkeys`   | `'Mod-E'`                               |

命令：`toggleCode()`。`exitable` 允许在标记末尾按 `→` 退出。

## Subscript

| 选项           | 默认值        |
| -------------- | ------------- |
| `name`         | `'subscript'` |
| `shortcutkeys` | `'Mod-,'`     |

命令：`toggleSubscript()`。

## Superscript

| 选项           | 默认值          |
| -------------- | --------------- |
| `name`         | `'superscript'` |
| `shortcutkeys` | `'Mod-.'`       |

命令：`toggleSuperscript()`。

## Link

```ts
import { Link } from '@proseharbor-editor/core'
```

继承自 `@tiptap/extension-link`（因此 `openOnClick`、`autolink`、`linkOnPaste`、
`protocols`、`HTMLAttributes` 等都可配置），并额外添加了「点击选中整个链接文本」的插件。

| 选项       | 默认值                                                           |
| ---------- | ---------------------------------------------------------------- |
| `name`     | `'link'`                                                         |
| `command`  | `({ editor, href, target = '_blank', ...rest }) => setLink(...)` |
| `isActive` | `({ editor }) => editor.isActive('link')`                        |

| 命令                        | 说明           |
| --------------------------- | -------------- |
| `setLink({ href, target })` | 添加链接标记。 |
| `unsetLink()`               | 移除链接标记。 |

```ts
editor.chain().focus().setLink({ href: 'https://proseharbornote.com', target: '_blank' }).run()
```

菜单中输入的 URL 会通过 `sanitizeUrl()` 校验，`javascript:` 之类的链接会被拦截。

## TextStyle

承载 `color`、`fontFamily`、`fontSize` 的基础标记。在本项目中它是一个
**扩展**（在 `textStyle` 标记上注册全局属性），`priority` 为 `101`。

```ts
import { TextStyle } from '@proseharbor-editor/core'
```

| 选项             | 默认值 |
| ---------------- | ------ |
| `HTMLAttributes` | `{}`   |

命令：`removeEmptyTextStyle()`——移除已不含任何属性的 `textStyle` 标记。
`Color`、`FontFamily`、`FontSize` 都依赖 `TextStyle`，请务必一起加入。

## Color

```ts
import { Color } from '@proseharbor-editor/core'
```

| 选项    | 类型                    | 默认值          | 说明                                   |
| ------- | ----------------------- | --------------- | -------------------------------------- |
| `types` | `string[]`              | `['textStyle']` | 属性挂载到的节点 / 标记类型。          |
| `type`  | `'default' \| 'picker'` | `'default'`     | 紧凑色块还是完整 `IColorPicker` 面板。 |
| `title` | `string`                | `'color'`       | 菜单标题。                             |

| 命令              | 说明       |
| ----------------- | ---------- |
| `setColor(color)` | 设置颜色。 |
| `unsetColor()`    | 清除颜色。 |

菜单命令是切换式的：再次点击当前颜色即清除。

```ts
Color.configure({ type: 'picker' })
```

## Background

背景高亮，渲染为 `<mark data-background-color="…">`。

```ts
import { Background } from '@proseharbor-editor/core'
```

| 选项             | 类型                    | 默认值          | 说明                         |
| ---------------- | ----------------------- | --------------- | ---------------------------- |
| `type`           | `'default' \| 'picker'` | `'default'`     | 取色面板样式。               |
| `multicolor`     | `boolean`               | `true`          | 是否启用 `background` 属性。 |
| `HTMLAttributes` | `object`                | `{}`            | 渲染属性。                   |
| `shortcutkeys`   | `string`                | `'Mod-Shift-H'` |                              |

| 命令                      | 说明       |
| ------------------------- | ---------- |
| `setBackground(attrs)`    | 设置高亮。 |
| `toggleBackground(attrs)` | 切换高亮。 |
| `unsetBackground()`       | 清除高亮。 |

输入规则：`==文本==`（粘贴时同样生效）。

## FontFamily

```ts
import { FontFamily } from '@proseharbor-editor/core'
```

| 选项    | 类型                                 | 默认值             |
| ------- | ------------------------------------ | ------------------ |
| `types` | `string[]`                           | `['textStyle']`    |
| `fonts` | `{ label: string; value: string }[]` | 9 项预设（见下表） |

默认字体列表：

| 标签             | 值                                               |
| ---------------- | ------------------------------------------------ |
| `Default`        | `''`                                             |
| `MicrosoftYaHei` | `"Microsoft YaHei", "PingFang SC", sans-serif`   |
| `SimSun`         | `"SimSun", "STSong", serif`                      |
| `SimHei`         | `"SimHei", "STHeiti", sans-serif`                |
| `KaiTi`          | `"KaiTi", "STKaiti", serif`                      |
| `CourierNew`     | `"Courier New", Courier, monospace`              |
| `Arial`          | `Arial, "Helvetica Neue", Helvetica, sans-serif` |
| `Georgia`        | `Georgia, serif`                                 |
| `TimesNewRoman`  | `"Times New Roman", TimesNewRoman, serif`        |

| 命令                        | 说明       |
| --------------------------- | ---------- |
| `setFontFamily(fontFamily)` | 设置字体。 |
| `unsetFontFamily()`         | 重置字体。 |

```ts
FontFamily.configure({
  fonts: [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Mono', value: 'ui-monospace, monospace' },
  ],
})
```

> 标签文案通过 `fonts.{label}` 这个 i18n key 翻译。

## FontSize

```ts
import { FontSize } from '@proseharbor-editor/core'
```

| 选项    | 类型                     | 默认值          | 说明             |
| ------- | ------------------------ | --------------- | ---------------- |
| `types` | `string[]`               | `['textStyle']` |                  |
| `type`  | `'default' \| 'complex'` | `'default'`     | 使用哪套字号表。 |
| `sizes` | `{ label, value }[]`     | getter          | 由 `type` 推导。 |

`default` 字号：

| 标签     | 值       |
| -------- | -------- |
| `tiny`   | `0.65em` |
| `small`  | `0.85em` |
| `normal` | `''`     |
| `large`  | `1.2em`  |
| `huge`   | `1.5em`  |

`complex` 字号：`10px`、`12px`、`13px`、`14px`、`15px`、`16px`、`18px`、
`20px`、`24px`、`28px`、`32px`、`36px`。

| 命令                    | 说明       |
| ----------------------- | ---------- |
| `setFontSize(fontSize)` | 设置字号。 |
| `unsetFontSize()`       | 重置字号。 |

```ts
FontSize.configure({ type: 'complex' })
```

## TextAlign

对齐是**全局属性**而非标记，但配置方式与其它文字样式扩展一致。

```ts
import { TextAlign } from '@proseharbor-editor/core'
```

| 选项               | 类型       | 默认值                                                   | 说明                       |
| ------------------ | ---------- | -------------------------------------------------------- | -------------------------- |
| `alignments`       | `string[]` | `['left','center','right','justify']`                    | 允许的取值。               |
| `defaultAlignment` | `string`   | `'left'`                                                 | 等于该值时**不**渲染样式。 |
| `types`            | `string[]` | `['heading','paragraph']`                                | 属性挂载到的节点类型。     |
| `list`             | `array`    | `alignLeft`、`alignCenter`、`alignRight`、`alignJustify` | 菜单分组。                 |

| 命令                      | 说明         |
| ------------------------- | ------------ |
| `setTextAlign(alignment)` | 设置对齐。   |
| `unsetTextAlign()`        | 重置为默认。 |

快捷键：`Mod-Shift-L` / `E` / `R` / `J`。

```ts
TextAlign.configure({ types: ['heading', 'paragraph', 'listItem'] })
```
