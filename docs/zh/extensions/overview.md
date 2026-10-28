# 扩展总览

编辑器的所有能力都来自扩展：**节点**（块级或行内元素）、**标记**（行内格式）或
普通**扩展**（行为、插件、全局属性）。

所有扩展都从 `@proseharbor-editor/core` 导出，并使用 Tiptap 的
`Node.create` / `Mark.create` / `Extension.create` API 编写。

```ts
import { Bold, Heading, Placeholder } from '@proseharbor-editor/core'
```

## 使用扩展

```ts
import { Editor, Document, Text, Paragraph, Bold, Italic } from '@proseharbor-editor/core'

const editor = new Editor({
  element: document.querySelector('#editor') as HTMLElement,
  extensions: [Document, Text, Paragraph, Bold, Italic],
})
```

多数情况下你会直接使用[套件](../kit/basic)——套件本身就是一个聚合了其它扩展的扩展。

## 配置

```ts
Heading.configure({ levels: [1, 2, 3] })
```

套件为每个被包含的扩展提供一个同名选项，传 `false` 即可移除：

```ts
RichTextKit.configure({
  heading: { levels: [1, 2, 3] },
  table: false,
})
```

## 菜单元信息

每个内置扩展的 options 里都带有**菜单描述符**，工具栏、气泡菜单与斜杠菜单据此渲染：

```ts
interface ExtensionMeta {
  name?: string                       // i18n key + 图标名 + 插槽名
  desc?: string                       // 斜杠菜单中的提示语
  icon?: string
  group?: string
  slash?: boolean                     // 是否出现在 "/" 菜单
  command?: (ctx: { editor, range?, ...args }) => boolean | void
  isActive?: (ctx: { editor }) => boolean
  isDisabled?: (ctx: { editor }) => boolean
  shortcutkeys?: string | string[]
  sort?: number
}
```

工具栏项会按名字查找同名扩展并把其 options 展开，因此配置扩展即配置按钮。

```ts
RichTextKit.configure({
  color: { type: 'picker' }, // 颜色按钮改为打开完整取色面板
})
```

## 完整清单

### 节点

| 扩展                                 | 说明                        |
| ------------------------------------ | --------------------------- |
| [`Document`](./nodes#document)       | 根节点，可选 `title` 块。   |
| [`Text`](./nodes#text)               | 文本节点。                  |
| [`Paragraph`](./nodes#paragraph)     | 段落块。                    |
| [`Heading`](./nodes#heading)         | 一 ~ 六级标题。             |
| [`HardBreak`](./nodes#hardbreak)     | 换行。                      |
| [`Blockquote`](./nodes#blockquote)   | 引用块。                    |
| [`Divider`](./nodes#divider)         | 分割线。                    |
| [`BulletList`](./nodes#bulletlist)   | 无序列表。                  |
| [`OrderedList`](./nodes#orderedlist) | 有序列表。                  |
| [`ListItem`](./nodes#listitem)       | 两种列表共用的列表项。      |
| [`TaskList`](./nodes#tasklist)       | 任务列表。                  |
| [`CodeBlock`](./nodes#codeblock)     | 代码块。                    |
| [`Image`](./nodes#image)             | 行内 / 块级图片，支持缩放。 |
| [`Table`](./nodes#table)             | 可调列宽的表格。            |

### 标记

| 扩展                                 | 说明                 |
| ------------------------------------ | -------------------- |
| [`Bold`](./marks#bold)               | 加粗。               |
| [`Italic`](./marks#italic)           | 斜体。               |
| [`Underline`](./marks#underline)     | 下划线。             |
| [`Strike`](./marks#strike)           | 删除线。             |
| [`Code`](./marks#code)               | 行内代码。           |
| [`Subscript`](./marks#subscript)     | 下标。               |
| [`Superscript`](./marks#superscript) | 上标。               |
| [`Link`](./marks#link)               | 超链接。             |
| [`TextStyle`](./marks#textstyle)     | 文字样式的基础标记。 |
| [`Color`](./marks#color)             | 文字颜色。           |
| [`Background`](./marks#background)   | 背景高亮。           |
| [`FontFamily`](./marks#fontfamily)   | 字体。               |
| [`FontSize`](./marks#fontsize)       | 字号。               |
| [`TextAlign`](./marks#textalign)     | 对齐（全局属性）。   |

### 功能

| 扩展                                          | 说明                 |
| --------------------------------------------- | -------------------- |
| [`Placeholder`](./features#placeholder)       | 空状态提示。         |
| [`History`](./features#history)               | 撤销 / 重做。        |
| [`Indent`](./features#indent)                 | 块缩进。             |
| [`CharacterCount`](./features#charactercount) | 字数统计。           |
| [`Dropcursor`](./features#dropcursor)         | 拖拽落点指示。       |
| [`Gapcursor`](./features#gapcursor)           | 空节点光标。         |
| [`Typography`](./features#typography)         | 智能标点。           |
| [`Selection`](./features#selection)           | 失焦时保留选区高亮。 |
| [`UniqueID`](./features#uniqueid)             | 块唯一 ID。          |
| [`Toc`](./features#toc)                       | 目录数据。           |
| [`BubbleMenu`](./features#bubblemenu)         | 浮动选区菜单。       |
| [`CommandSlash`](./features#commandslash)     | `/` 命令菜单。       |
| [`CommandAKeymap`](./features#commandakeymap) | 更合理的 `Mod-A`。   |
| [`DragHandle`](./features#draghandle)         | 块拖拽手柄。         |

## 编写自己的扩展

见[自定义扩展](./custom)。
