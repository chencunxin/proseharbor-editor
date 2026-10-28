# Node Extensions

Node extensions describe the blocks and inline elements of the document.

## Document

The root node. Without it there is no valid schema.

```ts
import { Document } from '@proseharbor-editor/core'
```

| Option           | Type      | Default                                | Description                                                          |
| ---------------- | --------- | -------------------------------------- | -------------------------------------------------------------------- |
| `title`          | `boolean` | `false`                                | Prepend an editable `title` node (`content` becomes `title block+`). |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__doc' }` | Attributes rendered on the root element.                             |

```ts
Document.configure({ title: true })
```

::: tip
The `title` node is internal (`extensions/title.ts`) — it is registered
automatically when `title: true`. It renders as an `<h1>` with the
`proseharbor-editor__title` class.
:::

## Text

```ts
import { Text } from '@proseharbor-editor/core'
```

Re-export of `@tiptap/extension-text`. No options. Required by every schema.

## Paragraph

```ts
import { Paragraph } from '@proseharbor-editor/core'
```

| Option           | Type      | Default                                      | Description           |
| ---------------- | --------- | -------------------------------------------- | --------------------- |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__paragraph' }` | Rendered attributes.  |
| `slash`          | `boolean` | `true`                                       | Show in the `/` menu. |
| `shortcutkeys`   | `string`  | `'Mod-Alt-0'`                                | Displayed in menus.   |

Commands: `setParagraph()`. Priority is `1000` so it wins over other textblocks.

```ts
editor.chain().focus().setParagraph().run()
```

## Heading

```ts
import { Heading } from '@proseharbor-editor/core'
```

| Option           | Type       | Default                                    | Description                         |
| ---------------- | ---------- | ------------------------------------------ | ----------------------------------- |
| `levels`         | `number[]` | `[1, 2, 3, 4, 5, 6]`                       | Allowed heading levels.             |
| `HTMLAttributes` | `object`   | `{ class: 'proseharbor-editor__heading' }` | Rendered attributes.                |
| `list`           | `array`    | `heading1` … `heading6`                    | Menu group, one entry per level.    |
| `slash`          | `boolean`  | `true`                                     | Expands to one `/` entry per level. |

| Command                    | Description                     |
| -------------------------- | ------------------------------- |
| `setHeading({ level })`    | Convert the block to a heading. |
| `toggleHeading({ level })` | Toggle heading / paragraph.     |

Shortcuts: `Mod-Alt-1` … `Mod-Alt-6`. Input rule: `# ` … `###### `.

```ts
Heading.configure({ levels: [1, 2, 3] })
```

## HardBreak

```ts
import { HardBreak } from '@proseharbor-editor/core'
```

| Option                 | Type      | Default | Description                                |
| ---------------------- | --------- | ------- | ------------------------------------------ |
| `keepMarks`            | `boolean` | `true`  | Keep active marks after the break.         |
| `linebreakReplacement` | `boolean` | `true`  | Replace `\n` in pasted text with a `<br>`. |
| `HTMLAttributes`       | `object`  | `{}`    | Rendered attributes.                       |

Command: `setHardBreak()`. Shortcuts: `Mod-Enter`, `Shift-Enter`.

## Blockquote

```ts
import { Blockquote } from '@proseharbor-editor/core'
```

| Option           | Type      | Default           | Description           |
| ---------------- | --------- | ----------------- | --------------------- |
| `HTMLAttributes` | `object`  | `{}`              | Rendered attributes.  |
| `slash`          | `boolean` | `true`            | Show in the `/` menu. |
| `desc`           | `string`  | `'> proseharbor'` | Slash menu hint.      |

| Command              | Description              |
| -------------------- | ------------------------ |
| `setBlockquote()`    | Wrap the block.          |
| `toggleBlockquote()` | Toggle the wrap.         |
| `unsetBlockquote()`  | Lift the block back out. |

Shortcut: `Mod-Shift-B`. Input rule: `> `.

## Divider

```ts
import { Divider } from '@proseharbor-editor/core'
```

| Option           | Type      | Default                                    | Description          |
| ---------------- | --------- | ------------------------------------------ | -------------------- |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__divider' }` | Rendered attributes. |
| `slash`          | `boolean` | `true`                                     | Show in `/` menu.    |

Command: `setDivider()` — always inserts at top level and makes sure a text block
follows, so you can keep typing. Input rules: `---`, `—-`, `___ `, `*** `.

## BulletList

```ts
import { BulletList } from '@proseharbor-editor/core'
```

| Option           | Type      | Default                                        | Description          |
| ---------------- | --------- | ---------------------------------------------- | -------------------- |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__bullet-list' }` | Rendered attributes. |
| `slash`          | `boolean` | `true`                                         | Show in `/` menu.    |

Command: `toggleBulletList()`. Shortcut: `Mod-Shift-8`. Input rule: `- ` / `* `.

> `ListItem` is **not** added automatically — add it yourself or use a kit.

## OrderedList

```ts
import { OrderedList } from '@proseharbor-editor/core'
```

Same shape as `BulletList`:

| Option           | Default                                         |
| ---------------- | ----------------------------------------------- |
| `HTMLAttributes` | `{ class: 'proseharbor-editor__ordered-list' }` |

Command: `toggleOrderedList()`. Shortcut: `Mod-Shift-7`. Input rule: `1. `.

## ListItem

```ts
import { ListItem } from '@proseharbor-editor/core'
```

| Option                | Type     | Default         | Description                    |
| --------------------- | -------- | --------------- | ------------------------------ |
| `HTMLAttributes`      | `object` | `{}`            | Rendered attributes.           |
| `bulletListTypeName`  | `string` | `'bulletList'`  | Name of the bullet list node.  |
| `orderedListTypeName` | `string` | `'orderedList'` | Name of the ordered list node. |

Content is `paragraph block*`, so a list item can hold nested blocks.

| Shortcut    | Command           |
| ----------- | ----------------- |
| `Enter`     | `splitListItem()` |
| `Tab`       | `sinkListItem()`  |
| `Shift-Tab` | `liftListItem()`  |

## TaskList

```ts
import { TaskList } from '@proseharbor-editor/core'
```

| Option           | Default                                      |
| ---------------- | -------------------------------------------- |
| `HTMLAttributes` | `{ class: 'proseharbor-editor__task-list' }` |
| `slash`          | `true`                                       |

Command: `toggleTaskList()`. Shortcut: `Mod-Shift-9`. Input rule: `[] ` / `[x] `.

`TaskList` registers `TaskItem.configure({ nested: true })` for you.

## CodeBlock

```ts
import { CodeBlock } from '@proseharbor-editor/core'
```

| Option                | Type             | Default       | Description                                    |
| --------------------- | ---------------- | ------------- | ---------------------------------------------- |
| `languageClassPrefix` | `string`         | `'language-'` | Class prefix for highlighting.                 |
| `exitOnTripleEnter`   | `boolean`        | `true`        | Leave the block after three line breaks.       |
| `exitOnArrowDown`     | `boolean`        | `true`        | Leave the block with `↓` at the end.           |
| `defaultLanguage`     | `string \| null` | `null`        | Default language attribute.                    |
| `tabSize`             | `number`         | `2`           | Spaces inserted by `Tab`.                      |
| `useTab`              | `boolean`        | `false`       | Insert a real tab character instead of spaces. |
| `nodeView`            | `function`       | `undefined`   | Custom node view (e.g. `VueNodeViewRenderer`). |
| `HTMLAttributes`      | `object`         | `{}`          | Rendered attributes.                           |
| `slash`               | `boolean`        | `true`        | Show in `/` menu.                              |

Command: `toggleCodeBlock()`. Shortcut: `Mod-Shift-C`. Input rule: ` ``` `.
`Tab` / `Shift-Tab` indent and outdent inside the block.

```ts
import { VueNodeViewRenderer } from '@proseharbor-editor/vue3'
import CodeBlockView from './CodeBlockView.vue'

CodeBlock.configure({ nodeView: VueNodeViewRenderer(CodeBlockView) })
```

## Image

```ts
import { Image } from '@proseharbor-editor/core'
```

| Option           | Type                              | Default                                  | Description                                 |
| ---------------- | --------------------------------- | ---------------------------------------- | ------------------------------------------- |
| `inline`         | `boolean`                         | `true`                                   | Inline vs. block image.                     |
| `allowBase64`    | `boolean`                         | `true`                                   | Allow `data:` URLs when no uploader is set. |
| `uploadImage`    | `(file: File) => Promise<string>` | `null`                                   | Custom uploader; falls back to base64.      |
| `HTMLAttributes` | `object`                          | `{ class: 'proseharbor-editor__image' }` | Rendered attributes.                        |
| `slash`          | `boolean`                         | `true`                                   | Show in `/` menu.                           |

Attributes:

```ts
interface ImageAttributes {
  src?: string | null
  alt?: string | null
  title?: string | null
  width?: string | null
  height?: string | null
  align?: 'left' | 'center' | 'right'
}
```

| Command              | Description                |
| -------------------- | -------------------------- |
| `setImage(attrs)`    | Insert an image.           |
| `updateImage(attrs)` | Update the selected image. |

The extension also adds a plugin that draws a selection outline and four resize
handles (minimum 50px, aspect ratio preserved).

```ts
Image.configure({
  uploadImage: async (file: File) => uploadAndGetUrl(file),
})
```

::: warning
Without `uploadImage`, files are inlined as base64 and rejected above **2 MB**
(the menu logs a warning).
:::

Alignment note: inline images follow the `textAlign` of their paragraph; only
block images use their own `align` attribute.

## Table

```ts
import { Table } from '@proseharbor-editor/core'
```

`Table` registers `TableRow`, `TableHeader` and `TableCell` automatically.

| Option           | Type      | Default                                  | Description                                     |
| ---------------- | --------- | ---------------------------------------- | ----------------------------------------------- |
| `resizable`      | `boolean` | `true`                                   | Column resizing through the custom `TableView`. |
| `View`           | `class`   | `TableView`                              | Node view managing the `<colgroup>`.            |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__table' }` | Rendered attributes.                            |
| `slash`          | `boolean` | `true`                                   | Show in `/` menu.                               |

Commands (inherited from `@tiptap/extension-table`): `insertTable`,
`addColumnBefore`, `addColumnAfter`, `deleteColumn`, `addRowBefore`,
`addRowAfter`, `deleteRow`, `mergeCells`, `splitCell`, `toggleHeaderRow`,
`toggleHeaderColumn`, `toggleHeaderCell`, `deleteTable`, …

Default menu command inserts a 3 × 3 table without a header row:

```ts
editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: false })
```
