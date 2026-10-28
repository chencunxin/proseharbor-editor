# 自定义扩展

本编辑器基于 Tiptap，所以**自定义扩展就是一个标准的 Tiptap 扩展**（`Node.create` /
`Mark.create` / `Extension.create`）。

想让扩展出现在菜单里，只需要在它的 `options` 中额外提供一份**菜单元信息**，三处菜单
都从这份信息里取值：

| 入口     | 如何出现                                          | 关键配置                            |
| -------- | ------------------------------------------------- | ----------------------------------- |
| 工具栏   | 把扩展名写进 `ProseharborEditorToolbar` 的 `sort` | `name` + `command`                  |
| 气泡菜单 | 把扩展名写进 `ProseharborEditorBubble` 的 `sort`  | `name` + `command` + **`isActive`** |
| 斜杠菜单 | 自动收集所有带该标记的扩展                        | `slash: true`                       |

> `sort` 是「白名单」：不在里面的扩展不会渲染成按钮。默认 sort 是内置的一大串常量，
> 传入自定义 sort 时会整体覆盖，因此需要把想要的按钮全部写一遍（见
> [工具栏](#添加到工具栏)）。

## 菜单元信息字段

```ts
interface MenuMeta {
  name: string                                    // 唯一标识：图标名 + i18n key + 插槽名
  desc?: string                                   // 描述（保留字段，当前斜杠菜单不渲染）
  slash?: boolean                                 // 是否出现在 "/" 菜单
  command: (ctx: { editor, range?, ...args }) => boolean | void
  isActive?: (ctx: { editor }) => boolean          // 气泡菜单必填
  isDisabled?: (ctx: { editor }) => boolean        // 可选，常用 !editor.can().xxx()
  shortcutkeys?: string | string[]                 // 仅展示，真正的绑定另写
  list?: MenuMeta[]                                // 分组菜单（多按钮）
}
```

约定：

- `name` 必须与扩展的 `name` 一致，工具栏 / 气泡菜单靠它查找扩展。
- `command` 由斜杠菜单调用时会多传一个 `range`（`/xxx` 文本的范围），插入前要先
  `deleteRange(range)`，否则关键字会残留在文档里。
- `shortcutkeys` **只是菜单上的提示文本**，真正的按键必须在
  `addKeyboardShortcuts()` 里注册。
- `desc` 目前不参与渲染，斜杠菜单显示的是 `t(name)`。

## 一个最小的标记

```ts
import { Mark, mergeAttributes } from '@proseharbor-editor/core'
import type { CommandProps } from '@proseharbor-editor/core'

// 自定义命令需要补类型声明，否则 editor.commands.toggleHighlight() 会报类型错误
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      toggleHighlight: () => ReturnType
    }
  }
}

export const Highlight = Mark.create({
  name: 'highlight',

  addOptions() {
    return {
      // ---- 菜单元信息 ----
      name: 'highlight',
      desc: '高亮选中文字',
      slash: true,
      // 内置的 background 已占用 Mod-Shift-H，这里换一个
      shortcutkeys: 'Mod-Alt-H',
      command: ({ editor, range }) =>
        range
          ? editor.chain().focus().deleteRange(range).toggleHighlight().run()
          : editor.chain().focus().toggleHighlight().run(),
      isActive: ({ editor }) => editor.isActive('highlight'),
      isDisabled: ({ editor }) => !editor.can().toggleHighlight(),
      // --------------------
      HTMLAttributes: {
        class: 'custom-highlight',
        // 内置 background 也用 <mark>，加个标记避免解析时互相干扰
        'data-type': 'highlight',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'mark[data-type="highlight"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleHighlight:
        () =>
        // playground / 业务项目通常开启 noImplicitAny，参数要显式标注
        ({ commands }: CommandProps) =>
          commands.toggleMark(this.name),
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-h': () => this.editor.commands.toggleHighlight(),
    }
  },
})
```

像其它扩展一样使用：

```ts
const extensions = [RichTextKit, Highlight]
```

::: warning
两个容易踩的坑：

1. 内置 `background` 扩展同样渲染 `<mark>`，如果自定义的 `parseHTML` 也直接写
   `{ tag: 'mark' }`，两者会在解析 HTML 时互相吞掉。用属性选择器区分即可。
2. 快捷键不要与内置扩展冲突（`background` 已占用 `Mod-Shift-H`）。
   :::

## 带属性的节点

```ts
import { Node, mergeAttributes, prefixClass } from '@proseharbor-editor/core'
import type { CommandProps } from '@proseharbor-editor/core'

export type CalloutVariant = 'info' | 'warning' | 'danger'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      toggleCallout: (attributes?: { variant?: CalloutVariant }) => ReturnType
    }
  }
}

export const Callout = Node.create({
  name: 'callout',

  addOptions() {
    return {
      name: 'callout',
      desc: '提示块',
      slash: true,
      command: ({ editor, range }) =>
        range
          ? editor.chain().focus().deleteRange(range).toggleCallout().run()
          : editor.chain().focus().toggleCallout().run(),
      isActive: ({ editor }) => editor.isActive('callout'),
      isDisabled: ({ editor }) => !editor.can().toggleCallout(),
      HTMLAttributes: { class: `${prefixClass}__callout` },
    }
  },

  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info' as CalloutVariant,
        parseHTML: (element) => (element.getAttribute('data-variant') as CalloutVariant) ?? 'info',
        renderHTML: (attributes) => ({ 'data-variant': attributes.variant }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-type': 'callout' }, this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      toggleCallout:
        (attributes = {}) =>
        ({ commands }: CommandProps) =>
          commands.toggleWrap(this.name, attributes),
    }
  },
})
```

::: tip
斜杠菜单会传入 `range`：插入前先删除它，这样输入的 `/callout` 文本才会消失。
:::

::: warning
**非文本块节点不能用 `commands.setNode()` 插入**——tiptap 会打印
`Currently "setNode()" only supports text block nodes.` 并返回 `false`。
`content: 'block+'` 这类容器节点请用 `wrapIn` / `lift` / `toggleWrap`
（把当前块包进容器 / 从容器里退出 / 两者切换）。
只有 `content: 'inline*'` 的文本块（如 `heading`）才可以用 `setNode()`。
:::

## 用 Vue 渲染 node view

```vue
<!-- CalloutView.vue -->
<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@proseharbor-editor/vue3'

const props = defineProps<{ node: any; updateAttributes: (attrs: any) => void }>()
</script>

<template>
  <NodeViewWrapper :data-variant="node.attrs.variant" class="callout">
    <select
      :value="node.attrs.variant"
      @change="updateAttributes({ variant: ($event.target as HTMLSelectElement).value })"
    >
      <option value="info">信息</option>
      <option value="warning">警告</option>
    </select>
    <NodeViewContent />
  </NodeViewWrapper>
</template>
```

```ts
import { VueNodeViewRenderer } from '@proseharbor-editor/vue3'
import CalloutView from './CalloutView.vue'

Callout.configure({ nodeView: VueNodeViewRenderer(CalloutView) })
```

::: warning
`NodeViewWrapper` 必须作为根元素，否则 `VueNodeView` 会抛错。
:::

## 添加到工具栏

工具栏按名字查找同名扩展并展开其 options，因此扩展只要带 `command` 就够了：

```ts
const toolbarSort = ['bold', 'italic', '|', 'highlight']
```

```vue
<ProseharborEditorToolbar :editor="editor" :sort="toolbarSort" />
```

`sort` 支持三种元素：

| 元素                          | 说明                                                    |
| ----------------------------- | ------------------------------------------------------- |
| `'bold'`                      | 字符串：按 `name` 查找扩展，展开它的 options 作为菜单项 |
| `'                            | '`                                                      | 垂直分割线 |
| `{ name, command, isActive }` | 对象：直接内联一个菜单项，不要求存在同名扩展            |

也可以直接传对象：

```ts
const toolbarSort = [
  'bold',
  {
    name: 'callout',
    command: ({ editor }) => editor.chain().focus().toggleCallout().run(),
    isActive: ({ editor }) => editor.isActive('callout'),
    isDisabled: ({ editor }) => !editor.can().toggleCallout(),
  },
]
```

注意：

- 默认 `sort` 是一份内置常量（历史、字体、对齐、表格……），传入自定义 `sort` 会整体
  替换，需要把想要的按钮都写进去。
- 字符串找不到同名扩展时会被静默忽略。
- `link`、`textAlign`、`color`、`background`、`fontFamily`、`fontSize`、`table`、
  `image`、`codeView` 这几个名字会走各自的专用组件（下拉面板 / 弹窗），自定义扩展请
  避开这些名字。
- `history`、`indent` 这类分组项需要提供 `list` 数组，见[分组菜单](#分组菜单)。
- 代码预览模式或光标位于代码块内时，除 `history` / `codeView` 外的按钮会自动禁用。

还可以用与菜单同名的插槽覆盖按钮（工具栏与气泡菜单都支持）：

```vue
<ProseharborEditorToolbar :editor="editor">
  <template #callout="{ editor, command, isActive }">
    <button :class="{ active: isActive({ editor }) }" @click="command({ editor })">提示块</button>
  </template>
</ProseharborEditorToolbar>
```

插槽参数就是 `{ editor, ...菜单项 }`；另有 `#prefix` / `#suffix` 可在首尾插入内容。

## 添加到气泡菜单

与工具栏完全一致，只是组件换成 `ProseharborEditorBubble`：

```vue
<ProseharborEditorBubble :editor="editor" :sort="['bold', 'italic', '|', 'highlight', 'callout']" />
```

::: warning
气泡菜单的默认渲染会**直接调用** `menu.isActive({ editor })`（没有做可选调用保护），
所以气泡菜单项**必须提供 `isActive`**，否则渲染时抛错。工具栏则允许缺省。
:::

气泡菜单只在文本选区（且不在链接 / 表格 / 图片选区）下显示基础菜单，链接、表格、图片
各有专用面板。

## 出现在斜杠菜单中

设置 `slash: true` 即可，`/` 菜单会自动收集所有 `options.slash` 为真的扩展，无需配置
`sort`。

```ts
Callout.configure({ slash: true, desc: '提示块' })
```

斜杠菜单需要 `CommandSlash` 扩展提供 suggestion 能力：

- `NotionKit` 默认已包含，可以直接 `NotionKit.configure({ commandSlash: createSlashSuggestion() })`；
- **`RichTextKit` 不含 `commandSlash`**，需要自己注册：

```ts
import { CommandSlash } from '@proseharbor-editor/core'
import { RichTextKit, createSlashSuggestion } from '@proseharbor-editor/vue3'

const extensions = [
  RichTextKit.configure({ placeholder: { placeholder: '输入 / 唤起斜杠菜单' } }),
  CommandSlash.configure(createSlashSuggestion()),
  Highlight,
  Callout,
]
```

过滤时会匹配扩展名与翻译后的文案（`item.name.includes(query) || t(item.name).includes(query)`），
因此若需要中文可搜，请把 key 加入语言包：

```ts
import { addLocale } from '@proseharbor-editor/core'

addLocale('zh', { callout: '提示块' })
```

::: tip
斜杠菜单项是 `{ icon, t(name), shortcutkeys }` 三件套，`desc` 不参与渲染；
`heading` 这类带 `list` 的扩展会把 `list` 展开成多项。
:::

## 图标怎么设置

工具栏、气泡菜单、斜杠菜单都用内置组件 `IIcon` 渲染图标，而 `IIcon` **固定把 `name`
解析成内置 Iconify 图标集里的 `proseharbor-editor:{kebab-case 的 name}`**：

| 菜单项 name   | 实际取的图标                      |
| ------------- | --------------------------------- |
| `highlight`   | `proseharbor-editor:highlight`    |
| `myHighlight` | `proseharbor-editor:my-highlight` |
| `codeView`    | `proseharbor-editor:code-view`    |

内置图标集只覆盖了内置扩展，所以**自定义扩展必须自己注册同名图标，否则按钮是空白的**
（不会报错，只是渲染不出来）。菜单元信息里的 `icon` 字段目前不生效。

### 注册图标

用 `@iconify/vue` 的 `addIcon` / `addCollection` 往同一个前缀里注册，24×24 的 SVG：

```ts
// icons.ts —— 在渲染前执行即可（模块顶层 / main.ts 里 import 一次）
import { addIcon } from '@iconify/vue'

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
```

批量注册（图标多时更方便）：

```ts
import { addCollection } from '@iconify/vue'

addCollection({
  prefix: 'proseharbor-editor',
  icons: {
    highlight: { body: '...', width: 24, height: 24 },
    callout: { body: '...', width: 24, height: 24 },
  },
})
```

注册完成后，工具栏 / 气泡菜单 / 斜杠菜单三处会自动用上该图标，无需再传任何参数。

::: tip
`@iconify/vue` 是 `@proseharbor-editor/vue3` 的依赖，业务项目里若要做类型化引用，可
自行安装同名版本。图标数据也可以来自 Iconify 的任意图标集，只要把 `body` 取出注册到
`proseharbor-editor` 前缀下即可。
:::

### 用插槽自定义图标

不想受图标集约束时，用具名插槽接管渲染，图标可以是任意 SVG、组件或文字：

```vue
<ProseharborEditorToolbar :editor="editor" :sort="toolbarSort">
  <template #callout="{ editor, command, isActive }">
    <IButton :active="isActive({ editor })" @click="command({ editor })">
      <svg viewBox="0 0 24 24" width="14" height="14">
        <path fill="none" stroke="currentColor" stroke-width="2" d="M4 5h16v14H4zM8 9h8" />
      </svg>
    </IButton>
  </template>
</ProseharborEditorToolbar>
```

`IButton` / `ITooltip` / `IIcon` 等都从 `@proseharbor-editor/vue3` 导出，可复用内置样式
（激活态、tooltip、快捷键提示）。

## 文案与国际化

菜单标题、tooltip 都走 `t(name)`，取不到时回退成 `name` 本身。补充文案：

```ts
import { addLocale } from '@proseharbor-editor/core'

addLocale('zh', { highlight: '高亮', callout: '提示块' })
addLocale('en', { highlight: 'Highlight', callout: 'Callout' })
```

## 分组菜单

`Heading`、`TextAlign`、`History`、`Indent` 这类扩展通过 `list` 暴露多个菜单项，
工具栏会把它们渲染成多个按钮：

```ts
const ClearGroup = Extension.create({
  name: 'clearGroup',
  addOptions() {
    return {
      name: 'clearGroup',
      list: [
        {
          name: 'clearMarks',
          command: ({ editor }) => editor.chain().focus().unsetAllMarks().run(),
          isActive: () => false,
        },
        {
          name: 'clearNodes',
          command: ({ editor }) => editor.chain().focus().clearNodes().run(),
          isActive: () => false,
        },
      ],
    }
  },
})
```

然后在 `sort` 中引用 `'clearGroup'`。分组项里每一条的 `name` 同样决定它的图标名与文案
key（`proseharbor-editor:clear-marks`、 `t('clearMarks')`）。

## 把扩展打包成自己的套件

```ts
import { Extension } from '@proseharbor-editor/core'
import { RichTextKit } from '@proseharbor-editor/vue3'

export const MyKit = RichTextKit.extend({
  name: 'myKit',
  addExtensions() {
    return [...(this.parent?.() ?? []), Highlight, Callout]
  },
})
```

这样 `MyKit.configure({ heading: { levels: [1, 2, 3] } })` 依然可用，而你的扩展
会成为所有使用该套件的编辑器的一部分。

## 完整示例

`playground/src/views/custom-extension-page/` 下有一份可运行的完整示例（访问
`/custom-extension`）：

```
extensions/highlight.ts   # 自定义 Mark：工具栏 + 气泡菜单 + 斜杠菜单
extensions/callout.ts     # 自定义 Node：带属性、块级包裹
extensions/icons.ts       # 注册自定义图标
extensions/index.ts       # 注册 i18n 文案
custom-extension-page.vue # 组装：sort / 插槽 / CommandSlash
```

## 检查清单

- [ ] `name`——唯一，同时作为图标名 / i18n key / 插槽名。
- [ ] `command`——接收 `{ editor, range?, ...args }`，斜杠菜单下先 `deleteRange(range)`。
- [ ] `isActive`——**气泡菜单项必须提供**。
- [ ] `isDisabled`——可选，可用 `editor.can().…`。
- [ ] `shortcutkeys`——仅用于显示；真正的按键绑定要在 `addKeyboardShortcuts()` 中注册，
      且不要与内置扩展冲突。
- [ ] `slash: true` + `desc`——出现在 `/` 菜单中（需确保 `CommandSlash` 已启用）。
- [ ] 以 `proseharbor-editor:{kebab-case name}` 注册图标，或用同名插槽自定义。
- [ ] 把文案加入语言包。
- [ ] 把扩展名写进工具栏 / 气泡菜单的 `sort`。

## 排错

| 现象                      | 原因                                                                        |
| ------------------------- | --------------------------------------------------------------------------- |
| 按钮是空白的              | 图标没注册，或注册的 name 不是 kebab-case（`myHighlight` → `my-highlight`） |
| 按钮根本不出现            | 没写进 `sort`；或字符串与扩展 `name` 不一致                                 |
| 气泡菜单报错 / 一直不高亮 | 菜单项缺少 `isActive`                                                       |
| 斜杠菜单不弹出            | 未启用 `CommandSlash`（`RichTextKit` 需自行注册）                           |
| 点击没反应                | 命令返回 `false`，常见原因是块级节点用了 `setNode()`                        |
| 输入 `/xxx` 后关键字残留  | `command` 里没有 `deleteRange(range)`                                       |
| 自定义 mark 显示/解析异常 | 与内置 `background` 的 `<mark>` 冲突，用属性选择器区分                      |
