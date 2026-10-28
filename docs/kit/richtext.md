# Rich Text Kit

`RichTextKit` is the recommended preset for a classic WYSIWYG editor: everything
in [BasicKit](./basic) plus headings, lists, tables, images, code blocks and the
full text styling set.

```ts
import { RichTextKit } from '@proseharbor-editor/vue3'
```

## Usage

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

## What's included

Everything from `BasicKit`, plus:

| Group       | Extensions                                                                          |
| ----------- | ----------------------------------------------------------------------------------- |
| Blocks      | `Heading`, `Blockquote`, `Divider`, `CodeBlock`                                     |
| Lists       | `BulletList`, `OrderedList`, `TaskList`, `ListItem`                                 |
| Marks       | `Bold`, `Italic`, `Underline`, `Strike`, `Code`, `Subscript`, `Superscript`, `Link` |
| Text style  | `TextStyle`, `Color`, `Background`, `FontFamily`, `FontSize`, `TextAlign`           |
| Rich blocks | `Table` (with `TableRow` / `TableHeader` / `TableCell`), `Image`                    |
| Meta        | `UniqueID`, `Toc`                                                                   |

## Default overrides

```ts
Color.configure({ type: 'picker' })
Background.configure({ type: 'picker' })
Table.configure({})
```

`type: 'picker'` makes the colour and highlight buttons open the full
`IColorPicker` panel instead of the compact swatch row.

## Options

Same rule as `BasicKit` — one option per extension, pass an object to configure
or `false` to remove it:

```ts
RichTextKit.configure({
  heading: { levels: [1, 2, 3] },
  placeholder: { placeholder: 'Write something…' },
  image: {
    uploadImage: async (file) => {
      /* -> url */
    },
  },
  color: { type: 'picker' },
  background: { type: 'picker' },
  table: false, // no tables
  taskList: false, // no checkboxes
})
```

Frequently used options:

| Option       | Type              | Notes                                           |
| ------------ | ----------------- | ----------------------------------------------- |
| `heading`    | `object \| false` | `{ levels: [1,2,3,4,5,6] }`                     |
| `image`      | `object \| false` | `{ uploadImage }`, `{ allowBase64 }`            |
| `link`       | `object \| false` | Link marks, `openOnClick`, `autolink`…          |
| `textAlign`  | `object \| false` | `{ alignments, defaultAlignment, types }`       |
| `fontSize`   | `object \| false` | `{ type: 'default' \| 'complex' }`              |
| `fontFamily` | `object \| false` | `{ fonts: [{ value, label }] }`                 |
| `codeBlock`  | `object \| false` | `{ useTab, tabSize, defaultLanguage, … }`       |
| `uniqueID`   | `object \| false` | `{ types: ['paragraph'], attributeName: 'id' }` |
| `toc`        | `object \| false` | `{ levels: [1,2,3,4,5,6] }`                     |

## Image uploads

Without `uploadImage`, images are inlined as base64 and rejected when larger
than **2 MB**:

```ts
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
})
```

## Table of contents

`Toc` is part of the kit, so you can render `<ProseharborEditorToc>`:

```vue
<ProseharborEditorToc v-if="editorRef?.editor" :editor="editorRef.editor" />
```

## Markdown input rules

With `enableInputRules` left at its default you get:

| Type             | Result       |
| ---------------- | ------------ |
| `# ` … `###### ` | Heading 1–6  |
| `> `             | Blockquote   |
| `- ` / `* `      | Bullet list  |
| `1. `            | Ordered list |
| `[] ` / `[x] `   | Task list    |
| `--- ` / `*** `  | Divider      |
| ` ``` `          | Code block   |
| `==text==`       | Highlight    |

## Next

- [Notion Kit](./notion) — adds `/` commands and block drag & drop.
- [Extensions reference](../extensions/overview)
