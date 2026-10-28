# Notion 套件

`NotionKit` 是块编辑器预设：[富文本套件](./richtext)的能力，再加上斜杠命令菜单
与块拖拽手柄。

```ts
import { NotionKit } from '@proseharbor-editor/vue3'
```

## 用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ProseharborEditor,
  ProseharborEditorToolbar,
  ProseharborEditorBubble,
  ProseharborEditorToc,
  NotionKit,
} from '@proseharbor-editor/vue3'
import '@proseharbor-editor/vue3/style.css'

const content = ref('')
const editorRef = ref()
const extensions = [NotionKit.configure({ placeholder: { placeholder: '按 "/" 执行命令…' } })]
</script>

<template>
  <ProseharborEditorToolbar v-if="editorRef?.editor" :editor="editorRef.editor" />
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
  <ProseharborEditorBubble v-if="editorRef?.editor" :editor="editorRef.editor" />
</template>
```

## 与 RichTextKit 的差异

| 能力                       | RichTextKit          | NotionKit                            |
| -------------------------- | -------------------- | ------------------------------------ |
| 标记 / 节点 / 文字样式     | ✅                   | ✅                                   |
| `CommandSlash`（`/` 菜单） | ❌                   | ✅（通过 `createSlashSuggestion()`） |
| `DragHandle`               | ❌                   | ✅                                   |
| `Color` / `Background`     | `{ type: 'picker' }` | 保持默认                             |

```ts
// notion-kit.ts
if (this.options.commandSlash !== false) {
  extensions.push(CommandSlash.configure(this.options?.commandSlash || createSlashSuggestion()))
}

if (this.options.dragHandle !== false) {
  extensions.push(DragHandle.configure(this.options?.dragHandle))
}
```

## 斜杠菜单

在块首输入 `/` 唤起命令菜单。候选来自所有 options 中含 `slash: true` 的扩展
（`Heading` 会按级别展开），并按名称或翻译文案过滤。

```
/heading1      -> 一级标题
/bulletList    -> 无序列表
/codeBlock     -> 代码块
/table         -> 3x3 表格
```

键盘：`↑` / `↓` 移动，`Enter` 插入，`Esc` 关闭。代码块内不会弹出。

```ts
import { createSlashSuggestion, NotionKit } from '@proseharbor-editor/vue3'

const extensions = [
  NotionKit.configure({
    commandSlash: createSlashSuggestion({
      char: '/',
      tippyOptions: { placement: 'bottom-start', maxWidth: 320 },
    }),
  }),
]
```

让自己的节点出现在菜单里，只需设置 `slash: true` 与 `desc`：

```ts
import { Blockquote } from '@proseharbor-editor/core'

Blockquote.configure({ slash: true, desc: '> quote' })
```

## 拖拽手柄

`DragHandle` 会在鼠标悬停的块左侧渲染手柄，可拖拽移动块。

```ts
NotionKit.configure({
  dragHandle: {
    handleId: 'editor-handle',
    handleBarId: 'editor-handle-bar',
  },
})
```

设为 `dragHandle: false` 即可移除。

## 目录

由于包含 `Toc` 与 `UniqueID`，标题拥有稳定 ID，目录组件可以滚动定位：

```vue
<ProseharborEditorToc
  v-if="editorRef?.editor"
  :editor="editorRef.editor"
  :scroll-view="scrollView"
/>
```

## 配置项

包含 `RichTextKit` 的全部选项，另加：

| 选项           | 类型              | 默认值                      | 说明                                                           |
| -------------- | ----------------- | --------------------------- | -------------------------------------------------------------- |
| `commandSlash` | `object \| false` | `createSlashSuggestion()`   | suggestion 配置（`char`、`items`、`render`、`tippyOptions`）。 |
| `dragHandle`   | `object \| false` | `{ handleId, handleBarId }` | 拖拽手柄配置。                                                 |

```ts
NotionKit.configure({
  commandSlash: false, // 不要 "/" 菜单
  dragHandle: false, // 不要拖拽手柄
  heading: { levels: [1, 2, 3] },
})
```

## 禁用某个块类型

```ts
NotionKit.configure({
  table: false,
  taskList: false,
  codeBlock: false,
})
```
