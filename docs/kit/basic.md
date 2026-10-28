# Basic Kit

`BasicKit` is the smallest usable preset: a valid schema plus the essentials
(paragraphs, history, breaks, indentation, placeholder). Use it when you want to
add your own marks and nodes one by one.

```ts
import { BasicKit } from '@proseharbor-editor/vue3'
```

> Kits live in `@proseharbor-editor/vue3`, **not** in the core package.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProseharborEditor, BasicKit } from '@proseharbor-editor/vue3'
import { Bold, Italic, Underline, Strike, Link, Code } from '@proseharbor-editor/core'
import '@proseharbor-editor/vue3/style.css'

const content = ref('')
const extensions = [
  BasicKit.configure({ placeholder: { placeholder: 'Write your opinion…' } }),
  Bold,
  Italic,
  Underline,
  Strike,
  Link,
  Code,
]
</script>

<template>
  <ProseharborEditor v-model="content" :extensions="extensions" />
</template>
```

## What's included

| Extension        | Kind      | Purpose                                     |
| ---------------- | --------- | ------------------------------------------- |
| `Document`       | node      | Root node (`block+`).                       |
| `Text`           | node      | Text node (from `@tiptap/extension-text`).  |
| `Paragraph`      | node      | Paragraph block.                            |
| `HardBreak`      | node      | Line break.                                 |
| `Gapcursor`      | extension | Cursor for otherwise unreachable positions. |
| `Dropcursor`     | extension | Drop indicator while dragging.              |
| `History`        | extension | Undo / redo.                                |
| `Indent`         | extension | Block indentation.                          |
| `Typography`     | extension | Smart quotes, dashes, ellipsis…             |
| `CommandAKeymap` | extension | Smarter `Mod-A`.                            |
| `CharacterCount` | extension | Character / word counting.                  |
| `Placeholder`    | extension | Empty state placeholder.                    |

## Default overrides

```ts
Dropcursor.configure({
  width: 5,
  color: 'rgba(var(--proseharbor-editor-theme-primary-val), 0.3)',
  class: 'proseharbor-editor-dropcursor',
})

Placeholder.configure({ placeholder: t('placeholder') })
```

## Options

Every included extension can be configured — or disabled — through the option
of the same name:

```ts
BasicKit.configure({
  // configure
  history: { depth: 200 },
  indent: { maxIndent: 5 },
  placeholder: { placeholder: 'Start typing…' },

  // disable
  typography: false,
  characterCount: false,
})
```

| Option           | Type              | Default                             |
| ---------------- | ----------------- | ----------------------------------- |
| `document`       | `object \| false` | `{}`                                |
| `text`           | `object \| false` | `{}`                                |
| `paragraph`      | `object \| false` | `{}`                                |
| `hardBreak`      | `object \| false` | `{}`                                |
| `gapcursor`      | `object \| false` | `{}`                                |
| `dropcursor`     | `object \| false` | see above                           |
| `history`        | `object \| false` | `{}`                                |
| `indent`         | `object \| false` | `{}`                                |
| `typography`     | `object \| false` | `{}`                                |
| `commandAKeymap` | `object \| false` | `{}`                                |
| `characterCount` | `object \| false` | `{}`                                |
| `placeholder`    | `object \| false` | `{ placeholder: t('placeholder') }` |

::: warning
Disabling `document`, `text` or `paragraph` leaves you without a valid schema.
Only do that if you provide replacements yourself.
:::

## Toolbar with BasicKit

Because `BasicKit` has no marks, only some toolbar entries resolve. Pass an
explicit `sort`:

```ts
const toolbar = ['bold', 'italic', 'underline', 'strike', 'code', 'link', '|', 'textClear']
```

```vue
<ProseharborEditorToolbar :editor="editor" :sort="toolbar" />
```

## Next

- [Rich Text Kit](./richtext) — everything above plus the full formatting set.
- [Notion Kit](./notion) — adds the slash menu and drag handle.
