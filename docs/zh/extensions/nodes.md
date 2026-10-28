# 节点扩展

节点扩展描述文档中的块级与行内元素。

## Document

根节点。没有它就没有合法的 schema。

```ts
import { Document } from '@proseharbor-editor/core'
```

| 选项             | 类型      | 默认值                                 | 说明                                                                 |
| ---------------- | --------- | -------------------------------------- | -------------------------------------------------------------------- |
| `title`          | `boolean` | `false`                                | 在最前面插入可编辑的 `title` 节点（`content` 变为 `title block+`）。 |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__doc' }` | 渲染到根元素上的属性。                                               |

```ts
Document.configure({ title: true })
```

::: tip
`title` 节点是内部扩展（`extensions/title.ts`），当 `title: true` 时自动注册，
渲染为带 `proseharbor-editor__title` 类的 `<h1>`。
:::

## Text

```ts
import { Text } from '@proseharbor-editor/core'
```

`@tiptap/extension-text` 的再导出，无配置项。任何 schema 都需要它。

## Paragraph

```ts
import { Paragraph } from '@proseharbor-editor/core'
```

| 选项             | 类型      | 默认值                                       | 说明                  |
| ---------------- | --------- | -------------------------------------------- | --------------------- |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__paragraph' }` | 渲染属性。            |
| `slash`          | `boolean` | `true`                                       | 是否出现在 `/` 菜单。 |
| `shortcutkeys`   | `string`  | `'Mod-Alt-0'`                                | 菜单中显示的快捷键。  |

命令：`setParagraph()`。优先级为 `1000`，因此优先于其它文本块。

```ts
editor.chain().focus().setParagraph().run()
```

## Heading

```ts
import { Heading } from '@proseharbor-editor/core'
```

| 选项             | 类型       | 默认值                                     | 说明                          |
| ---------------- | ---------- | ------------------------------------------ | ----------------------------- |
| `levels`         | `number[]` | `[1, 2, 3, 4, 5, 6]`                       | 允许的标题级别。              |
| `HTMLAttributes` | `object`   | `{ class: 'proseharbor-editor__heading' }` | 渲染属性。                    |
| `list`           | `array`    | `heading1` … `heading6`                    | 菜单分组，每级一项。          |
| `slash`          | `boolean`  | `true`                                     | 在 `/` 菜单中按级别展开多项。 |

| 命令                       | 说明                   |
| -------------------------- | ---------------------- |
| `setHeading({ level })`    | 转为标题。             |
| `toggleHeading({ level })` | 在标题与段落之间切换。 |

快捷键：`Mod-Alt-1` … `Mod-Alt-6`。输入规则：`# ` … `###### `。

```ts
Heading.configure({ levels: [1, 2, 3] })
```

## HardBreak

```ts
import { HardBreak } from '@proseharbor-editor/core'
```

| 选项                   | 类型      | 默认值 | 说明                              |
| ---------------------- | --------- | ------ | --------------------------------- |
| `keepMarks`            | `boolean` | `true` | 换行后保留已激活的标记。          |
| `linebreakReplacement` | `boolean` | `true` | 把粘贴文本中的 `\n` 转成 `<br>`。 |
| `HTMLAttributes`       | `object`  | `{}`   | 渲染属性。                        |

命令：`setHardBreak()`。快捷键：`Mod-Enter`、`Shift-Enter`。

## Blockquote

```ts
import { Blockquote } from '@proseharbor-editor/core'
```

| 选项             | 类型      | 默认值            | 说明                  |
| ---------------- | --------- | ----------------- | --------------------- |
| `HTMLAttributes` | `object`  | `{}`              | 渲染属性。            |
| `slash`          | `boolean` | `true`            | 是否出现在 `/` 菜单。 |
| `desc`           | `string`  | `'> proseharbor'` | 斜杠菜单提示语。      |

| 命令                 | 说明           |
| -------------------- | -------------- |
| `setBlockquote()`    | 包裹为引用块。 |
| `toggleBlockquote()` | 切换包裹。     |
| `unsetBlockquote()`  | 取消包裹。     |

快捷键：`Mod-Shift-B`。输入规则：`> `。

## Divider

```ts
import { Divider } from '@proseharbor-editor/core'
```

| 选项             | 类型      | 默认值                                     | 说明           |
| ---------------- | --------- | ------------------------------------------ | -------------- |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__divider' }` | 渲染属性。     |
| `slash`          | `boolean` | `true`                                     | `/` 菜单显示。 |

命令：`setDivider()`——始终插入到顶层块之间，并保证后面留出可输入的文本块。
输入规则：`---`、`—-`、`___ `、`*** `。

## BulletList

```ts
import { BulletList } from '@proseharbor-editor/core'
```

| 选项             | 类型      | 默认值                                         | 说明           |
| ---------------- | --------- | ---------------------------------------------- | -------------- |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__bullet-list' }` | 渲染属性。     |
| `slash`          | `boolean` | `true`                                         | `/` 菜单显示。 |

命令：`toggleBulletList()`。快捷键：`Mod-Shift-8`。输入规则：`- ` / `* `。

> `ListItem` **不会**自动添加——请自行加入，或使用套件。

## OrderedList

```ts
import { OrderedList } from '@proseharbor-editor/core'
```

与 `BulletList` 结构一致：

| 选项             | 默认值                                          |
| ---------------- | ----------------------------------------------- |
| `HTMLAttributes` | `{ class: 'proseharbor-editor__ordered-list' }` |

命令：`toggleOrderedList()`。快捷键：`Mod-Shift-7`。输入规则：`1. `。

## ListItem

```ts
import { ListItem } from '@proseharbor-editor/core'
```

| 选项                  | 类型     | 默认值          | 说明             |
| --------------------- | -------- | --------------- | ---------------- |
| `HTMLAttributes`      | `object` | `{}`            | 渲染属性。       |
| `bulletListTypeName`  | `string` | `'bulletList'`  | 无序列表节点名。 |
| `orderedListTypeName` | `string` | `'orderedList'` | 有序列表节点名。 |

content 为 `paragraph block*`，因此列表项可以容纳嵌套块。

| 快捷键      | 命令              |
| ----------- | ----------------- |
| `Enter`     | `splitListItem()` |
| `Tab`       | `sinkListItem()`  |
| `Shift-Tab` | `liftListItem()`  |

## TaskList

```ts
import { TaskList } from '@proseharbor-editor/core'
```

| 选项             | 默认值                                       |
| ---------------- | -------------------------------------------- |
| `HTMLAttributes` | `{ class: 'proseharbor-editor__task-list' }` |
| `slash`          | `true`                                       |

命令：`toggleTaskList()`。快捷键：`Mod-Shift-9`。输入规则：`[] ` / `[x] `。

`TaskList` 会自动注册 `TaskItem.configure({ nested: true })`。

## CodeBlock

```ts
import { CodeBlock } from '@proseharbor-editor/core'
```

| 选项                  | 类型             | 默认值        | 说明                                           |
| --------------------- | ---------------- | ------------- | ---------------------------------------------- |
| `languageClassPrefix` | `string`         | `'language-'` | 高亮类名前缀。                                 |
| `exitOnTripleEnter`   | `boolean`        | `true`        | 连续三个换行后退出代码块。                     |
| `exitOnArrowDown`     | `boolean`        | `true`        | 在末尾按 `↓` 退出代码块。                      |
| `defaultLanguage`     | `string \| null` | `null`        | 默认语言属性。                                 |
| `tabSize`             | `number`         | `2`           | `Tab` 插入的空格数。                           |
| `useTab`              | `boolean`        | `false`       | 插入真正的制表符而非空格。                     |
| `nodeView`            | `function`       | `undefined`   | 自定义 node view（如 `VueNodeViewRenderer`）。 |
| `HTMLAttributes`      | `object`         | `{}`          | 渲染属性。                                     |
| `slash`               | `boolean`        | `true`        | `/` 菜单显示。                                 |

命令：`toggleCodeBlock()`。快捷键：`Mod-Shift-C`。输入规则：` ``` `。
`Tab` / `Shift-Tab` 在块内做缩进与反缩进。

```ts
import { VueNodeViewRenderer } from '@proseharbor-editor/vue3'
import CodeBlockView from './CodeBlockView.vue'

CodeBlock.configure({ nodeView: VueNodeViewRenderer(CodeBlockView) })
```

## Image

```ts
import { Image } from '@proseharbor-editor/core'
```

| 选项             | 类型                              | 默认值                                   | 说明                                |
| ---------------- | --------------------------------- | ---------------------------------------- | ----------------------------------- |
| `inline`         | `boolean`                         | `true`                                   | 行内图片还是块级图片。              |
| `allowBase64`    | `boolean`                         | `true`                                   | 未配置上传时是否允许 `data:` URL。  |
| `uploadImage`    | `(file: File) => Promise<string>` | `null`                                   | 自定义上传函数；缺省时降级 base64。 |
| `HTMLAttributes` | `object`                          | `{ class: 'proseharbor-editor__image' }` | 渲染属性。                          |
| `slash`          | `boolean`                         | `true`                                   | `/` 菜单显示。                      |

属性：

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

| 命令                 | 说明           |
| -------------------- | -------------- |
| `setImage(attrs)`    | 插入图片。     |
| `updateImage(attrs)` | 更新选中图片。 |

扩展还内置插件绘制选中边框与四个缩放手柄（最小 50px，保持宽高比）。

```ts
Image.configure({
  uploadImage: async (file: File) => uploadAndGetUrl(file),
})
```

::: warning
未配置 `uploadImage` 时图片会内联为 base64，且超过 **2 MB** 会被拒绝（菜单会输出警告）。
:::

对齐说明：行内图片跟随所在段落的 `textAlign`；只有块级图片才使用自身的
`align` 属性。

## Table

```ts
import { Table } from '@proseharbor-editor/core'
```

`Table` 会自动注册 `TableRow`、`TableHeader`、`TableCell`。

| 选项             | 类型      | 默认值                                   | 说明                              |
| ---------------- | --------- | ---------------------------------------- | --------------------------------- |
| `resizable`      | `boolean` | `true`                                   | 通过自定义 `TableView` 调整列宽。 |
| `View`           | `class`   | `TableView`                              | 管理 `<colgroup>` 的 node view。  |
| `HTMLAttributes` | `object`  | `{ class: 'proseharbor-editor__table' }` | 渲染属性。                        |
| `slash`          | `boolean` | `true`                                   | `/` 菜单显示。                    |

命令（继承自 `@tiptap/extension-table`）：`insertTable`、`addColumnBefore`、
`addColumnAfter`、`deleteColumn`、`addRowBefore`、`addRowAfter`、`deleteRow`、
`mergeCells`、`splitCell`、`toggleHeaderRow`、`toggleHeaderColumn`、
`toggleHeaderCell`、`deleteTable` 等。

默认菜单命令插入 3 × 3、无表头的表格：

```ts
editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: false })
```
