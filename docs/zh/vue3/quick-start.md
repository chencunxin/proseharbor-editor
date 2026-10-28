# 快速开始（Vue 3）

`@proseharbor-editor/vue3` 把无界面内核封装成组件，并提供菜单、套件与样式。

## 安装

```bash
yarn add @proseharbor-editor/core @proseharbor-editor/vue3
```

`vue@^3.4.0` 是 peer 依赖。

## 最小示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProseharborEditor, RichTextKit } from '@proseharbor-editor/vue3'
import '@proseharbor-editor/vue3/style.css'

const content = ref('<p>Hello Proseharbor 👋</p>')
const extensions = [RichTextKit]
</script>

<template>
  <ProseharborEditor v-model="content" :extensions="extensions" />
</template>
```

## 加上工具栏与气泡菜单

菜单是独立组件，需要传入编辑器实例：

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

::: tip 为什么要 `v-if="editorRef?.editor"`？
编辑器在 `onMounted` 中创建，首次渲染时实例还不存在。加判断可以避免把
`undefined` 传给菜单必填的 `editor` 属性。
:::

## Notion 风格（斜杠菜单 + 拖拽手柄 + 目录）

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

const content = ref('')
const editorRef = ref()
const scrollView = ref<HTMLElement | null>(null)
const extensions = [NotionKit]
</script>

<template>
  <div class="layout">
    <aside>
      <ProseharborEditorToc
        v-if="editorRef?.editor"
        :editor="editorRef.editor"
        :scroll-view="scrollView"
      />
    </aside>

    <main ref="scrollView">
      <ProseharborEditorToolbar v-if="editorRef?.editor" :editor="editorRef.editor" />
      <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
      <ProseharborEditorBubble v-if="editorRef?.editor" :editor="editorRef.editor" />
    </main>
  </div>
</template>
```

## 局部引入 vs 全局注册

```ts
// main.ts
import { createApp } from 'vue'
import ProseharborEditor from '@proseharbor-editor/vue3'
import '@proseharbor-editor/vue3/style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

更推荐按需引入（可被 tree-shaking 优化）：

```ts
import { ProseharborEditor, ProseharborEditorToolbar } from '@proseharbor-editor/vue3'
```

## 手动拼装扩展

套件只是便利封装，完全可以自己从内核扩展组装 schema：

```ts
import {
  Document,
  Text,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strike,
  Link,
  Code,
} from '@proseharbor-editor/core'
import { ProseharborEditor } from '@proseharbor-editor/vue3'

const extensions = [Document, Text, Paragraph, Bold, Italic, Underline, Strike, Link, Code]
const toolbar = ['bold', 'italic', 'underline', 'strike', 'code', 'link', '|', 'textClear']
```

## 输出 HTML 或 JSON

```vue
<!-- v-model 收到字符串 -->
<ProseharborEditor v-model="html" output="html" :extensions="extensions" />

<!-- v-model 收到 ProseMirror JSON -->
<ProseharborEditor v-model="json" output="json" :extensions="extensions" />
```

## SSR

`ProseharborEditor` 在 `onMounted` 中创建编辑器，且 `changeTheme()` 在没有
`document` 时会跳过，因此可以安全地在服务端渲染。若框架的 hydration 出现问题，
再考虑仅在客户端挂载。

## 下一步

- [编辑器组件 API](./editor)
- [菜单组件](./components)
- [套件](../kit/basic)
