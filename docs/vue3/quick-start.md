# Quick Start (Vue 3)

`@proseharbor-editor/vue3` wraps the headless core in a component and adds the
menus, kits and styles.

## Install

```bash
yarn add @proseharbor-editor/core @proseharbor-editor/vue3
```

`vue@^3.4.0` is a peer dependency.

## Minimal setup

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

## With toolbar and bubble menu

Menus are standalone components and need the editor instance:

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
const extensions = [RichTextKit.configure({ placeholder: { placeholder: 'Write something…' } })]
</script>

<template>
  <ProseharborEditorToolbar v-if="editorRef?.editor" :editor="editorRef.editor" />

  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />

  <ProseharborEditorBubble v-if="editorRef?.editor" :editor="editorRef.editor" />
</template>
```

::: tip Why `v-if="editorRef?.editor"`?
The editor is created in `onMounted`, so on first render the instance does not
exist yet. Guarding the menus avoids passing `undefined` to their required
`editor` prop.
:::

## Notion style (slash menu + drag handle + TOC)

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

## Local registration vs global

```ts
// main.ts
import { createApp } from 'vue'
import ProseharborEditor from '@proseharbor-editor/vue3'
import '@proseharbor-editor/vue3/style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

Or import the named exports where you need them (recommended — keeps the bundle
small and is fully tree-shakeable):

```ts
import { ProseharborEditor, ProseharborEditorToolbar } from '@proseharbor-editor/vue3'
```

## Composing extensions by hand

Kits are convenient but optional. You can assemble the schema yourself from the
core extensions:

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

## Output HTML or JSON

```vue
<!-- v-model receives a string -->
<ProseharborEditor v-model="html" output="html" :extensions="extensions" />

<!-- v-model receives ProseMirror JSON -->
<ProseharborEditor v-model="json" output="json" :extensions="extensions" />
```

## SSR

`ProseharborEditor` creates the editor in `onMounted` and `changeTheme()` skips
work when `document` is unavailable, so the component is safe to render on the
server. Only mount it client side if you hit issues with your framework's
hydration.

## Next steps

- [Editor component API](./editor)
- [Menu components](./components)
- [Kits](../kit/basic)
