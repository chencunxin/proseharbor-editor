# Examples

The pages below render real editor instances — feel free to type in them.

## Basic editor

`BasicKit` plus a handful of marks, with a minimal toolbar and the bubble menu
disabled.

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

<BaseEditor placeholder="Write your opinion…" />

## Rich text editor

`RichTextKit` with the default toolbar and bubble menu.

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

<RichTextEditor placeholder="Write something…" />

## Notion style editor

`NotionKit` — press `/` for the command menu and use the handle on the left to
drag blocks.

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

<NotionStyleEditor placeholder='Write something, or press "/" to execute commands…' />

## Uploading images

`Image` accepts an `uploadImage` hook; without it, files are inlined as base64
(and rejected above 2 MB).

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

## Counting characters

Enable `CharacterCount` (already part of every kit) and read it from the
instance:

```ts
const { characters, words } = editorRef.value.editor.getCharacters()
```

::: warning
`getCharacters()` **returns** an `Error` object (it does not throw) when
`CharacterCount` is not part of the schema.
:::

## Switching to HTML source view

```vue
<script setup lang="ts">
const editorRef = ref()
</script>

<template>
  <button @click="editorRef?.toggleCodeView()">Toggle source</button>
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
</template>
```

## Full playground

A complete Vite project with all of the above lives in the `playground/`
directory of the repository:

```bash
yarn install
yarn dev
```
