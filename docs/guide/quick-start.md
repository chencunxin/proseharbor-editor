# Quick Start

## Requirements

| Requirement | Version                                        |
| ----------- | ---------------------------------------------- |
| Node        | `>= 18`                                        |
| Vue         | `^3.4.0` (only for `@proseharbor-editor/vue3`) |
| Bundler     | Vite / webpack / any ESM aware bundler         |

## Install

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
Only using the headless core? Install `@proseharbor-editor/core` alone — it has
no framework dependency.
:::

## Vue 3 usage

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

// One kit gives you a complete rich text setup
const extensions = [
  RichTextKit.configure({
    placeholder: { placeholder: 'Write something…' },
  }),
]
</script>

<template>
  <ProseharborEditorToolbar v-if="editorRef?.editor" :editor="editorRef.editor" />

  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />

  <ProseharborEditorBubble v-if="editorRef?.editor" :editor="editorRef.editor" />
</template>
```

Three things are worth noting:

1. **Styles must be imported**: `import '@proseharbor-editor/vue3/style.css'`.
2. **Extensions are passed as an array**; the recommended way to get a full
   featured editor is one of the [kits](../kit/basic) (`BasicKit`,
   `RichTextKit`, `NotionKit`).
3. **Menus are separate components** and need the editor instance, so render
   them after the instance exists (`v-if="editorRef?.editor"`).

## Vanilla (core only)

The core has no `createEditor()` factory — instantiate the class directly:

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

// Commands are plain Tiptap commands
editor.chain().focus().toggleBold().run()
```

::: warning
`Document`, `Text` and `Paragraph` are **not** included automatically. If you
compose the extension list by hand, always add them, otherwise the schema is
invalid. Kits already contain them.
:::

## Reading and writing content

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProseharborEditor, RichTextKit } from '@proseharbor-editor/vue3'

const content = ref('')
const editorRef = ref()

const extensions = [RichTextKit]

// output: 'html' (default) -> v-model receives a string
// output: 'json'           -> v-model receives a ProseMirror JSON object
</script>

<template>
  <ProseharborEditor ref="editorRef" v-model="content" output="html" :extensions="extensions" />
</template>
```

You can also read the content from the instance at any time:

```ts
const editor = editorRef.value.editor

editor.getHTML() // '<p>Hello</p>'
editor.getJSON() // { type: 'doc', content: [ … ] }
editor.getText() // 'Hello'
editor.commands.setContent('<p>Replaced</p>')
```

## Notion style in three lines

```ts
import { NotionKit } from '@proseharbor-editor/vue3'

const extensions = [NotionKit]
```

`NotionKit` adds the slash command menu (`/`) and the block drag handle on top
of the rich text kit. See [Notion Kit](../kit/notion).

## Next steps

- [Editor component API](../vue3/editor)
- [Events](../core/events)
- [Commands](../core/commands)
- [Internationalization](./i18n)
- [Theming](./theming)
