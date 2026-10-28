# Notion Kit

`NotionKit` is the block-editor preset: the [Rich Text Kit](./richtext) feature
set plus the slash command menu and the block drag handle.

```ts
import { NotionKit } from '@proseharbor-editor/vue3'
```

## Usage

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
const extensions = [
  NotionKit.configure({ placeholder: { placeholder: 'Press "/" for commands…' } }),
]
</script>

<template>
  <ProseharborEditorToolbar v-if="editorRef?.editor" :editor="editorRef.editor" />
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
  <ProseharborEditorBubble v-if="editorRef?.editor" :editor="editorRef.editor" />
</template>
```

## Differences from RichTextKit

| Feature                     | RichTextKit          | NotionKit                          |
| --------------------------- | -------------------- | ---------------------------------- |
| Marks / nodes / text style  | ✅                   | ✅                                 |
| `CommandSlash` (`/` menu)   | ❌                   | ✅ (via `createSlashSuggestion()`) |
| `DragHandle`                | ❌                   | ✅                                 |
| `Color` / `Background` type | `{ type: 'picker' }` | default                            |

```ts
// notion-kit.ts
if (this.options.commandSlash !== false) {
  extensions.push(CommandSlash.configure(this.options?.commandSlash || createSlashSuggestion()))
}

if (this.options.dragHandle !== false) {
  extensions.push(DragHandle.configure(this.options?.dragHandle))
}
```

## Slash menu

Type `/` at the start of a block to open the command menu. The candidate list is
built from every extension whose options contain `slash: true` (`Heading` is
expanded into one entry per level), and filtered by name or translated label.

```
/heading1      -> H1
/bulletList    -> bullet list
/codeBlock     -> code block
/table         -> 3x3 table
```

Keyboard: `↑` / `↓` to move, `Enter` to insert, `Esc` to dismiss. The menu never
opens inside a code block.

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

Add your own node to the menu by setting `slash: true` and a `desc`:

```ts
import { Blockquote } from '@proseharbor-editor/core'

Blockquote.configure({ slash: true, desc: '> quote' })
```

## Drag handle

`DragHandle` renders a handle on the left of the hovered block so it can be
dragged, plus a bar to open the block actions.

```ts
NotionKit.configure({
  dragHandle: {
    handleId: 'editor-handle',
    handleBarId: 'editor-handle-bar',
  },
})
```

Set `dragHandle: false` to remove it.

## Table of contents

Because `Toc` and `UniqueID` are included, headings get stable ids and the TOC
component can scroll to them:

```vue
<ProseharborEditorToc
  v-if="editorRef?.editor"
  :editor="editorRef.editor"
  :scroll-view="scrollView"
/>
```

## Options

All `RichTextKit` options, plus:

| Option         | Type              | Default                     | Description                                                           |
| -------------- | ----------------- | --------------------------- | --------------------------------------------------------------------- |
| `commandSlash` | `object \| false` | `createSlashSuggestion()`   | Suggestion configuration (`char`, `items`, `render`, `tippyOptions`). |
| `dragHandle`   | `object \| false` | `{ handleId, handleBarId }` | Drag handle configuration.                                            |

```ts
NotionKit.configure({
  commandSlash: false, // no "/" menu
  dragHandle: false, // no drag handle
  heading: { levels: [1, 2, 3] },
})
```

## Disabling a block type

```ts
NotionKit.configure({
  table: false,
  taskList: false,
  codeBlock: false,
})
```
