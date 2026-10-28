# 快速开始

## 环境要求

| 依赖     | 版本                                           |
| -------- | ---------------------------------------------- |
| Node     | `>= 18`                                        |
| Vue      | `^3.4.0`（仅 `@proseharbor-editor/vue3` 需要） |
| 构建工具 | Vite / webpack / 任意支持 ESM 的打包器         |

## 安装

::: code-group

```bash [yarn]
yarn add @proseharbor-editor/core @proseharbor-editor/vue3
```

```bash [npm]
npm install @proseharbor-editor/core @proseharbor-editor/vue3
```

```bash [pnpm]
pnpm add @proseharbor-editor/core @proseharbor-editor/vue3
```

:::

::: tip
只需要无界面内核？单独安装 `@proseharbor-editor/core` 即可，它不依赖任何框架。
:::

## 在 Vue 3 中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ProseharborEditor,
  ProseharborEditorToolbar,
  ProseharborEditorBubble,
  RichTextKit,
} from '@proseharbor-editor/vue3'
import '@proseharbor-editor/vue3/style.css'

const content = ref('<p>Hello Proseharbor 👋</p>')
const editorRef = ref()

// 一个套件即可获得完整的富文本能力
const extensions = [
  RichTextKit.configure({
    placeholder: { placeholder: '写点什么…' },
  }),
]
</script>

<template>
  <ProseharborEditorToolbar v-if="editorRef?.editor" :editor="editorRef.editor" />

  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />

  <ProseharborEditorBubble v-if="editorRef?.editor" :editor="editorRef.editor" />
</template>
```

三点需要注意：

1. **必须引入样式**：`import '@proseharbor-editor/vue3/style.css'`。
2. **扩展以数组形式传入**；推荐使用[套件](../kit/basic)（`BasicKit`、`RichTextKit`、`NotionKit`）快速获得完整能力。
3. **菜单是独立组件**且需要编辑器实例，因此要在实例存在之后再渲染（`v-if="editorRef?.editor"`）。

## 无框架使用（仅内核）

内核没有 `createEditor()` 工厂函数——直接实例化类即可：

```ts
import { Editor, Document, Text, Paragraph, Bold, Italic } from '@proseharbor-editor/core'

const editor = new Editor({
  element: document.querySelector('#editor') as HTMLElement,
  content: '<p>Hello Proseharbor 👋</p>',
  extensions: [Document, Text, Paragraph, Bold, Italic],
  autofocus: 'end',
  onUpdate: ({ editor }) => {
    console.log(editor.getHTML())
  },
})

// 命令就是 Tiptap 命令
editor.chain().focus().toggleBold().run()
```

::: warning
`Document`、`Text`、`Paragraph` **不会**被自动注入。手动拼装扩展列表时一定要加上它们，否则 schema 非法。套件已包含这些节点。
:::

## 读写内容

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProseharborEditor, RichTextKit } from '@proseharbor-editor/vue3'

const content = ref('')
const editorRef = ref()

const extensions = [RichTextKit]

// output: 'html'（默认）-> v-model 收到字符串
// output: 'json'        -> v-model 收到 ProseMirror JSON 对象
</script>

<template>
  <ProseharborEditor ref="editorRef" v-model="content" output="html" :extensions="extensions" />
</template>
```

也可以随时从实例读取内容：

```ts
const editor = editorRef.value.editor

editor.getHTML() // '<p>Hello</p>'
editor.getJSON() // { type: 'doc', content: [ … ] }
editor.getText() // 'Hello'
editor.commands.setContent('<p>替换后的内容</p>')
```

## 三行代码实现 Notion 风格

```ts
import { NotionKit } from '@proseharbor-editor/vue3'

const extensions = [NotionKit]
```

`NotionKit` 在富文本套件之上增加了斜杠命令菜单（`/`）与块拖拽手柄。详见
[Notion 套件](../kit/notion)。

## 下一步

- [编辑器组件 API](../vue3/editor)
- [事件](../core/events)
- [命令](../core/commands)
- [国际化](./i18n)
- [主题](./theming)
