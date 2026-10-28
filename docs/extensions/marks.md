# Mark Extensions

Marks apply inline formatting to text. Most are thin wrappers around the
official Tiptap marks with menu metadata (`command`, `isActive`, `isDisabled`,
`shortcutkeys`) added.

## Bold

```ts
import { Bold } from '@proseharbor-editor/core'
```

| Option         | Default             |
| -------------- | ------------------- |
| `name`         | `'bold'`            |
| `desc`         | `'**proseharbor**'` |
| `shortcutkeys` | `'Mod-B'`           |

Command: `toggleBold()`.

```ts
editor.chain().focus().toggleBold().run()
```

## Italic

| Option         | Default           |
| -------------- | ----------------- |
| `name`         | `'italic'`        |
| `desc`         | `'*proseharbor*'` |
| `shortcutkeys` | `'Mod-I'`         |

Command: `toggleItalic()`.

## Underline

| Option         | Default       |
| -------------- | ------------- |
| `name`         | `'underline'` |
| `shortcutkeys` | `'Mod-U'`     |

Command: `toggleUnderline()`.

## Strike

| Option         | Default             |
| -------------- | ------------------- |
| `name`         | `'strike'`          |
| `desc`         | `'~~proseharbor~~'` |
| `shortcutkeys` | `'Mod-Shift-S'`     |

Command: `toggleStrike()`.

## Code

| Option           | Default                                 |
| ---------------- | --------------------------------------- |
| `exitable`       | `true`                                  |
| `HTMLAttributes` | `{ class: 'proseharbor-editor__code' }` |
| `desc`           | ``'`proseharbor`'``                     |
| `shortcutkeys`   | `'Mod-E'`                               |

Command: `toggleCode()`. `exitable` lets you leave the mark with `→` at its end.

## Subscript

| Option         | Default       |
| -------------- | ------------- |
| `name`         | `'subscript'` |
| `shortcutkeys` | `'Mod-,'`     |

Command: `toggleSubscript()`.

## Superscript

| Option         | Default         |
| -------------- | --------------- |
| `name`         | `'superscript'` |
| `shortcutkeys` | `'Mod-.'`       |

Command: `toggleSuperscript()`.

## Link

```ts
import { Link } from '@proseharbor-editor/core'
```

Extends `@tiptap/extension-link` (so `openOnClick`, `autolink`, `linkOnPaste`,
`protocols`, `HTMLAttributes`, … are all available) and adds a plugin that
selects the whole link text when you click it.

| Option     | Default                                                          |
| ---------- | ---------------------------------------------------------------- |
| `name`     | `'link'`                                                         |
| `command`  | `({ editor, href, target = '_blank', ...rest }) => setLink(...)` |
| `isActive` | `({ editor }) => editor.isActive('link')`                        |

| Command                     | Description           |
| --------------------------- | --------------------- |
| `setLink({ href, target })` | Apply the link mark.  |
| `unsetLink()`               | Remove the link mark. |

```ts
editor.chain().focus().setLink({ href: 'https://proseharbornote.com', target: '_blank' }).run()
```

URLs entered through the menus are validated with `sanitizeUrl()`, so
`javascript:` links are rejected.

## TextStyle

The base mark that carries `color`, `fontFamily` and `fontSize`. It is an
**extension** in this project (global attributes on the `textStyle` mark), with
`priority: 101`.

```ts
import { TextStyle } from '@proseharbor-editor/core'
```

| Option           | Default |
| ---------------- | ------- |
| `HTMLAttributes` | `{}`    |

Command: `removeEmptyTextStyle()` — drops a `textStyle` mark that no longer holds
any attribute. `Color`, `FontFamily` and `FontSize` all depend on `TextStyle`, so
always include it.

## Color

```ts
import { Color } from '@proseharbor-editor/core'
```

| Option  | Type                    | Default         | Description                                   |
| ------- | ----------------------- | --------------- | --------------------------------------------- |
| `types` | `string[]`              | `['textStyle']` | Node/mark types the attribute is added to.    |
| `type`  | `'default' \| 'picker'` | `'default'`     | Compact swatches vs. the full `IColorPicker`. |
| `title` | `string`                | `'color'`       | Menu title.                                   |

| Command           | Description        |
| ----------------- | ------------------ |
| `setColor(color)` | Apply the colour.  |
| `unsetColor()`    | Remove the colour. |

The menu command toggles: applying the active colour again clears it.

```ts
Color.configure({ type: 'picker' })
```

## Background

Highlight colour, rendered as `<mark data-background-color="…">`.

```ts
import { Background } from '@proseharbor-editor/core'
```

| Option           | Type                    | Default         | Description                               |
| ---------------- | ----------------------- | --------------- | ----------------------------------------- |
| `type`           | `'default' \| 'picker'` | `'default'`     | Colour panel style.                       |
| `multicolor`     | `boolean`               | `true`          | Enable the `background` attribute at all. |
| `HTMLAttributes` | `object`                | `{}`            | Rendered attributes.                      |
| `shortcutkeys`   | `string`                | `'Mod-Shift-H'` |                                           |

| Command                   | Description           |
| ------------------------- | --------------------- |
| `setBackground(attrs)`    | Apply the highlight.  |
| `toggleBackground(attrs)` | Toggle the highlight. |
| `unsetBackground()`       | Remove the highlight. |

Input rule: `==text==` (also on paste).

## FontFamily

```ts
import { FontFamily } from '@proseharbor-editor/core'
```

| Option  | Type                                 | Default               |
| ------- | ------------------------------------ | --------------------- |
| `types` | `string[]`                           | `['textStyle']`       |
| `fonts` | `{ label: string; value: string }[]` | 9 presets (see below) |

Default font list:

| Label            | Value                                            |
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

| Command                     | Description       |
| --------------------------- | ----------------- |
| `setFontFamily(fontFamily)` | Apply the family. |
| `unsetFontFamily()`         | Reset the family. |

```ts
FontFamily.configure({
  fonts: [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Mono', value: 'ui-monospace, monospace' },
  ],
})
```

> Labels are translated with the `fonts.{label}` i18n key.

## FontSize

```ts
import { FontSize } from '@proseharbor-editor/core'
```

| Option  | Type                     | Default         | Description              |
| ------- | ------------------------ | --------------- | ------------------------ |
| `types` | `string[]`               | `['textStyle']` |                          |
| `type`  | `'default' \| 'complex'` | `'default'`     | Which size table to use. |
| `sizes` | `{ label, value }[]`     | getter          | Derived from `type`.     |

`default` sizes:

| Label    | Value    |
| -------- | -------- |
| `tiny`   | `0.65em` |
| `small`  | `0.85em` |
| `normal` | `''`     |
| `large`  | `1.2em`  |
| `huge`   | `1.5em`  |

`complex` sizes: `10px`, `12px`, `13px`, `14px`, `15px`, `16px`, `18px`,
`20px`, `24px`, `28px`, `32px`, `36px`.

| Command                 | Description     |
| ----------------------- | --------------- |
| `setFontSize(fontSize)` | Apply the size. |
| `unsetFontSize()`       | Reset the size. |

```ts
FontSize.configure({ type: 'complex' })
```

## TextAlign

Alignment is a **global attribute**, not a mark, but it is configured like the
other text style extensions.

```ts
import { TextAlign } from '@proseharbor-editor/core'
```

| Option             | Type       | Default                                                  | Description                        |
| ------------------ | ---------- | -------------------------------------------------------- | ---------------------------------- |
| `alignments`       | `string[]` | `['left','center','right','justify']`                    | Allowed values.                    |
| `defaultAlignment` | `string`   | `'left'`                                                 | Value that is **not** rendered.    |
| `types`            | `string[]` | `['heading','paragraph']`                                | Node types that get the attribute. |
| `list`             | `array`    | `alignLeft`, `alignCenter`, `alignRight`, `alignJustify` | Menu group.                        |

| Command                   | Description        |
| ------------------------- | ------------------ |
| `setTextAlign(alignment)` | Set the alignment. |
| `unsetTextAlign()`        | Reset to default.  |

Shortcuts: `Mod-Shift-L` / `E` / `R` / `J`.

```ts
TextAlign.configure({ types: ['heading', 'paragraph', 'listItem'] })
```
