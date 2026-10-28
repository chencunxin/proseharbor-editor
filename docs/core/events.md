# Events

The editor emits events through two channels:

1. **Options callbacks** passed to `new Editor({ ... })` (Tiptap style).
2. **Vue component events** when using `<ProseharborEditor>`.

Both are driven by the same underlying callbacks — the Vue component simply
re-emits them.

## Callback options

| Callback            | Fired when                                               | Payload                       |
| ------------------- | -------------------------------------------------------- | ----------------------------- |
| `onBeforeCreate`    | Before the editor view is created.                       | `{ editor }`                  |
| `onCreate`          | The editor is fully initialised and ready.               | `{ editor }`                  |
| `onUpdate`          | The document content changed.                            | `{ editor }`                  |
| `onSelectionUpdate` | The selection changed.                                   | `{ editor }`                  |
| `onTransaction`     | Any transaction was applied (fires very often).          | `{ editor, transaction }`     |
| `onFocus`           | The editor gained focus.                                 | `{ editor, event }`           |
| `onBlur`            | The editor lost focus.                                   | `{ editor, event }`           |
| `onDestroy`         | The instance was destroyed.                              | —                             |
| `onContentError`    | Content did not match the schema (`enableContentCheck`). | `{ editor, error, … }`        |
| `onPaste`           | Content was pasted.                                      | `{ editor, event, slice, … }` |
| `onDrop`            | Content was dropped.                                     | `{ editor, event, slice, … }` |

```ts
const editor = new Editor({
  element: document.querySelector('#editor') as HTMLElement,
  extensions: [RichTextKit],
  onCreate: ({ editor }) => console.log('ready', editor),
  onUpdate: ({ editor }) => console.log(editor.getHTML()),
  onFocus: ({ editor, event }) => console.log('focus', event),
})
```

::: tip
`onUpdate` only receives `{ editor }`. Read the content you need from it:
`editor.getHTML()`, `editor.getJSON()` or `editor.getText()`.
:::

## Subscribing imperatively

```ts
const onUpdate = () => console.log(editor.getHTML())

editor.on('update', onUpdate)
editor.off('update', onUpdate)
```

## Vue component events

```vue
<template>
  <ProseharborEditor
    v-model="content"
    :extensions="extensions"
    @create="onCreate"
    @update="onUpdate"
    @focus="onFocus"
    @blur="onBlur"
    @selection-update="onSelectionUpdate"
    @transaction="onTransaction"
    @paste="onPaste"
    @drop="onDrop"
    @destroy="onDestroy"
    @content-error="onContentError"
    @before-create="onBeforeCreate"
  />
</template>
```

| Event               | Payload                   | Notes                                                                                          |
| ------------------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| `update:modelValue` | `string \| object`        | HTML string when `output="html"` (default), JSON otherwise.                                    |
| `update`            | `{ output, editor }`      | Fired together with `update:modelValue`.                                                       |
| `beforeCreate`      | `{ editor }`              |                                                                                                |
| `create`            | `{ editor }`              | The component runs the update handler once before emitting it, so `v-model` is already filled. |
| `selectionUpdate`   | `{ editor }`              |                                                                                                |
| `transaction`       | `{ editor, transaction }` | High frequency — avoid heavy work here.                                                        |
| `focus`             | `{ editor, event }`       |                                                                                                |
| `blur`              | `{ editor, event }`       |                                                                                                |
| `destroy`           | —                         |                                                                                                |
| `contentError`      | `{ editor, error }`       | Requires `enableContentCheck`.                                                                 |
| `paste`             | `{ editor, event, … }`    | Spread from the original callback arguments.                                                   |
| `drop`              | `{ editor, event, … }`    | Spread from the original callback arguments.                                                   |

```ts
const onUpdate = ({ output, editor }: { output: string; editor: Editor }) => {
  console.log(output === editor.getHTML()) // true when output="html"
}
```

## Two-way binding details

- External changes to `v-model` are applied with
  `editor.commands.setContent(value ?? '', { emitUpdate: false })`, so they do
  **not** trigger `update` again.
- Internal edits set a flag before emitting and reset it on `nextTick`, which
  prevents update loops between parent and child.

## Debouncing saves

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const content = ref('')
const save = useDebounceFn((html: string) => api.save(html), 800)

watch(content, (html) => save(html))
</script>

<template>
  <ProseharborEditor v-model="content" :extensions="extensions" />
</template>
```
