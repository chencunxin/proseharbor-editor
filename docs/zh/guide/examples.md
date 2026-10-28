# 示例

下面页面中渲染的都是真实的编辑器实例，可以直接输入体验。

## 基础编辑器

`BasicKit` 加上若干行内标记，使用精简工具栏，并关闭气泡菜单。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProseharborEditor, ProseharborEditorToolbar, BasicKit } from '@proseharbor-editor/vue3'
import { Bold, Italic, Underline, Strike, Link, Code } from '@proseharbor-editor/core'
import '@proseharbor-editor/vue3/style.css'

const content = ref('')
const extensions = [BasicKit, Bold, Italic, Underline, Strike, Link, Code]
const toolbar = ['bold', 'italic', 'underline', 'strike', 'code', 'link', '|', 'textClear']
</script>

<template>
  <ProseharborEditor v-model="content" :extensions="extensions">
    <ProseharborEditorToolbar :sort="toolbar" :editor="editorRef.editor" />
  </ProseharborEditor>
</template>
```

<BaseEditor placeholder="写下你的想法…" />

## 富文本编辑器

`RichTextKit` + 默认工具栏 + 气泡菜单。

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

const content = ref('')
const editorRef = ref()
const extensions = [RichTextKit.configure({ placeholder: { placeholder: '写点什么…' } })]
</script>

<template>
  <ProseharborEditorToolbar v-if="editorRef?.editor" :editor="editorRef.editor" />
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
  <ProseharborEditorBubble v-if="editorRef?.editor" :editor="editorRef.editor" />
</template>
```

<RichTextEditor placeholder="写点什么…" />

## Notion 风格编辑器

`NotionKit`——输入 `/` 唤起命令菜单，用左侧手柄拖拽块。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ProseharborEditor,
  ProseharborEditorToolbar,
  ProseharborEditorBubble,
  NotionKit,
} from '@proseharbor-editor/vue3'
import '@proseharbor-editor/vue3/style.css'

const content = ref('')
const editorRef = ref()
const extensions = [NotionKit]
</script>

<template>
  <ProseharborEditorToolbar v-if="editorRef?.editor" :editor="editorRef.editor" />
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
  <ProseharborEditorBubble v-if="editorRef?.editor" :editor="editorRef.editor" />
</template>
```

<NotionStyleEditor placeholder='写点什么，或按 "/" 执行命令…' />

## 上传图片

`Image` 支持 `uploadImage` 钩子；未配置时图片会以 base64 内联（超过 2 MB 会被拒绝）。

```ts
const extensions = [
  RichTextKit.configure({
    image: {
      uploadImage: async (file: File) => {
        const form = new FormData()
        form.append('file', file)
        const { url } = await fetch('/api/upload', { method: 'POST', body: form }).then((r) =>
          r.json(),
        )
        return url
      },
    },
  }),
]
```

## 统计字数

启用 `CharacterCount`（所有套件均已包含）后从实例读取：

```ts
const { characters, words } = editorRef.value.editor.getCharacters()
```

::: warning
未注册 `CharacterCount` 时，`getCharacters()` 会**返回**一个 `Error` 对象（不会抛出）。
:::

## 切换到 HTML 源码视图

```vue
<script setup lang="ts">
const editorRef = ref()
</script>

<template>
  <button @click="editorRef?.toggleCodeView()">切换源码</button>
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
</template>
```

## 完整演示

仓库 `playground/` 目录下是一个包含上述全部示例的完整 Vite 项目：

```bash
yarn install
yarn dev
```
