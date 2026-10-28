# 命令

命令就是 Tiptap 命令。项目里没有 `run()` / `toggleBold()` 之类的独立导出函数——
命令都通过编辑器实例调用。

## 三种调用方式

```ts
// 1. 直接调用（不处理焦点）
editor.commands.toggleBold()

// 2. 命令链（推荐：保持焦点、可串联多个命令）
editor.chain().focus().toggleBold().setColor('#ff0000').run()

// 3. 条件判断
editor.can().toggleBold() // boolean
```

内置菜单用的就是 `editor.chain().focus().…​.run()`，因为点击按钮后需要恢复选区。

## 内置扩展提供的命令

### 块级

| 命令                       | 来源          | 说明                      |
| -------------------------- | ------------- | ------------------------- |
| `setParagraph()`           | `Paragraph`   | 转为段落。                |
| `setHeading({ level })`    | `Heading`     | 转为标题（`level` 1–6）。 |
| `toggleHeading({ level })` | `Heading`     | 在标题与段落间切换。      |
| `setBlockquote()`          | `Blockquote`  | 转为引用块。              |
| `toggleBlockquote()`       | `Blockquote`  | 切换引用块。              |
| `unsetBlockquote()`        | `Blockquote`  | 还原为段落。              |
| `setDivider()`             | `Divider`     | 在顶层插入分割线。        |
| `setHardBreak()`           | `HardBreak`   | 插入换行。                |
| `toggleCodeBlock()`        | `CodeBlock`   | 切换代码块。              |
| `toggleBulletList()`       | `BulletList`  | 切换无序列表。            |
| `toggleOrderedList()`      | `OrderedList` | 切换有序列表。            |
| `toggleTaskList()`         | `TaskList`    | 切换任务列表。            |
| `splitListItem(name)`      | `ListItem`    | 拆分列表项。              |
| `sinkListItem(name)`       | `ListItem`    | 嵌套（Tab）。             |
| `liftListItem(name)`       | `ListItem`    | 取消嵌套（Shift-Tab）。   |

### 文字样式

| 命令                           | 来源         | 说明                                      |
| ------------------------------ | ------------ | ----------------------------------------- |
| `setColor(color)`              | `Color`      | 设置文字颜色。                            |
| `unsetColor()`                 | `Color`      | 清除文字颜色。                            |
| `setBackground(attributes)`    | `Background` | 设置背景高亮。                            |
| `toggleBackground(attributes)` | `Background` | 切换背景高亮。                            |
| `unsetBackground()`            | `Background` | 清除高亮。                                |
| `setFontFamily(fontFamily)`    | `FontFamily` | 设置字体。                                |
| `unsetFontFamily()`            | `FontFamily` | 重置字体。                                |
| `setFontSize(fontSize)`        | `FontSize`   | 设置字号。                                |
| `unsetFontSize()`              | `FontSize`   | 重置字号。                                |
| `setTextAlign(alignment)`      | `TextAlign`  | `left` / `center` / `right` / `justify`。 |
| `unsetTextAlign()`             | `TextAlign`  | 重置为 `defaultAlignment`。               |
| `removeEmptyTextStyle()`       | `TextStyle`  | 移除空的 `textStyle` 标记。               |

### 标记、链接、图片

| 命令                        | 来源          | 说明                             |
| --------------------------- | ------------- | -------------------------------- |
| `toggleBold()`              | `Bold`        |                                  |
| `toggleItalic()`            | `Italic`      |                                  |
| `toggleUnderline()`         | `Underline`   |                                  |
| `toggleStrike()`            | `Strike`      |                                  |
| `toggleCode()`              | `Code`        | 行内代码。                       |
| `toggleSuperscript()`       | `Superscript` |                                  |
| `toggleSubscript()`         | `Subscript`   |                                  |
| `setLink({ href, target })` | `Link`        | 添加链接标记。                   |
| `unsetLink()`               | `Link`        | 移除链接标记。                   |
| `setImage(attrs)`           | `Image`       | 插入图片。                       |
| `updateImage(attrs)`        | `Image`       | 更新选中图片。                   |
| `unsetAllMarks()`           | Tiptap        | 清除全部标记（即 `textClear`）。 |

### 表格、目录、历史、缩进

| 命令                                         | 来源             | 说明                                     |
| -------------------------------------------- | ---------------- | ---------------------------------------- |
| `insertTable({ rows, cols, withHeaderRow })` | `Table`          | 插入表格。                               |
| `addColumnBefore()` / `addColumnAfter()`     | `Table`          | 列操作（另有 `deleteColumn`）。          |
| `addRowBefore()` / `addRowAfter()`           | `Table`          | 行操作（另有 `deleteRow`）。             |
| `mergeCells()` / `splitCell()`               | `Table`          | 合并 / 拆分单元格。                      |
| `toggleHeaderRow()` / `toggleHeaderColumn()` | `Table`          | 表头行 / 列。                            |
| `deleteTable()`                              | `Table`          | 删除整个表格。                           |
| `updateToc()`                                | `Toc`            | 重新计算 `editor.storage.toc.tocItems`。 |
| `undo()` / `redo()`                          | `History`        | 撤销 / 重做。                            |
| `indent()` / `outdent()`                     | `Indent`         | 调整块缩进。                             |
| `selectTextWithinNodeBoundaries()`           | `CommandAKeymap` | 选中当前节点内的文本（Mod-A）。          |

## 扩展上的菜单元信息

每个内置扩展的 options 里还带有**菜单描述符**，工具栏、气泡菜单与斜杠菜单正是
依据它渲染：

```ts
interface ExtensionMeta {
  name?: string
  desc?: string
  icon?: string
  group?: string
  slash?: boolean // 是否出现在 "/" 菜单
  command?: (context: { editor: Editor; range?: any; [key: string]: any }) => boolean | void
  isActive?: (context: { editor: Editor }) => boolean
  isDisabled?: (context: { editor: Editor }) => boolean
  shortcutkeys?: string | string[]
  sort?: number
}
```

因此执行菜单动作等价于调用 `options.command`：

```ts
const bold = editor.extensionManager.extensions.find((ext) => ext.name === 'bold')

bold?.options.command?.({ editor }) // 等价于 editor.chain().focus().toggleBold().run()
bold?.options.isActive?.({ editor }) // boolean
```

`Heading`、`TextAlign`、`History`、`Indent` 属于**分组**：它们的 `list` 选项里
是每个按钮的描述符。

```ts
Heading.configure({
  list: [{ name: 'heading1', command: ({ editor }) => editor.commands.setHeading({ level: 1 }) }],
})
```

## 快捷键

| 快捷键                      | 动作                          | 扩展                    |
| --------------------------- | ----------------------------- | ----------------------- |
| `Mod-B`                     | 加粗                          | `Bold`                  |
| `Mod-I`                     | 斜体                          | `Italic`                |
| `Mod-U`                     | 下划线                        | `Underline`             |
| `Mod-Shift-S`               | 删除线                        | `Strike`                |
| `Mod-E`                     | 行内代码                      | `Code`                  |
| `Mod-.`                     | 上标                          | `Superscript`           |
| `Mod-,`                     | 下标                          | `Subscript`             |
| `Mod-Shift-H`               | 背景高亮                      | `Background`            |
| `Mod-Alt-0`                 | 段落                          | `Paragraph`             |
| `Mod-Alt-1` … `6`           | 一级 … 六级标题               | `Heading`               |
| `Mod-Shift-8`               | 无序列表                      | `BulletList`            |
| `Mod-Shift-7`               | 有序列表                      | `OrderedList`           |
| `Mod-Shift-9`               | 任务列表                      | `TaskList`              |
| `Mod-Shift-B`               | 引用块                        | `Blockquote`            |
| `Mod-Shift-C`               | 代码块                        | `CodeBlock`             |
| `Mod-Enter` / `Shift-Enter` | 换行                          | `HardBreak`             |
| `Mod-Shift-L`               | 左对齐                        | `TextAlign`             |
| `Mod-Shift-E`               | 居中对齐                      | `TextAlign`             |
| `Mod-Shift-R`               | 右对齐                        | `TextAlign`             |
| `Mod-Shift-J`               | 两端对齐                      | `TextAlign`             |
| `Mod-Z` / `Mod-Shift-Z`     | 撤销 / 重做                   | `History`               |
| `Tab` / `Shift-Tab`         | 缩进 / 反缩进（列表、代码块） | `ListItem`、`CodeBlock` |
| `Mod-A`                     | 选中当前节点内文本            | `CommandAKeymap`        |

`Mod` 在 macOS 上是 `⌘`，其它系统是 `Ctrl`。显示文案由
`convertShortcutKeys()` 生成，它还会把 `Shift` 转成 `⇧`、`Alt` 转成 `⌥`、
`Enter` 转成 `↵`、`Backspace` 转成 `⌫`。

```ts
import { convertShortcutKeys } from '@proseharbor-editor/vue3'

convertShortcutKeys('Mod-Shift-B') // macOS 为 '⌘⇧B'，其它系统为 'Ctrl⇧B'
```

## 自定义命令

可以通过扩展 `addCommands()` 添加，也可以直接执行：

```ts
import { Extension } from '@proseharbor-editor/core'

const ClearFormatting = Extension.create({
  name: 'clearFormatting',
  addOptions() {
    return {
      name: 'clearFormatting',
      desc: '清除所有标记',
      slash: true,
      command: ({ editor }) => editor.chain().focus().unsetAllMarks().run(),
      isActive: () => false,
      isDisabled: ({ editor }) => !editor.can().unsetAllMarks(),
      shortcutkeys: 'Mod-Shift-X',
    }
  },
  addCommands() {
    return {
      clearFormatting:
        () =>
        ({ chain }) =>
          chain().focus().unsetAllMarks().run(),
    }
  },
})
```

完整流程见[自定义扩展](../extensions/custom)。
