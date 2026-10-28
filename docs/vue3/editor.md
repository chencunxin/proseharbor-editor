# ProseharborEditor

The main component. Note the spelling: **`ProseharborEditor`** (lowercase `h`).

```ts
import { ProseharborEditor } from '@proseharbor-editor/vue3'
```

## Props

| Prop                 | Type                          | Default   | Description                                                                                          |
| -------------------- | ----------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `modelValue`         | `object \| array \| string`   | `''`      | Editor content, supports `v-model`. A string is parsed as HTML, an object/array as ProseMirror JSON. |
| `extensions`         | `array`                       | `[]`      | Extension list. Only items with `type` of `extension`, `node` or `mark` are kept.                    |
| `locale`             | `string`                      | `'en'`    | Language tag. Watched reactively; calls `changeLocale()`.                                            |
| `theme`              | `string`                      | `'light'` | `'light'` or `'dark'`. Writes `proseharbor-theme` on `<body>`.                                       |
| `output`             | `string`                      | `'html'`  | `'html'` → `getHTML()`, anything else → `getJSON()` for `update:modelValue`.                         |
| `autofocus`          | `boolean \| string \| number` | `false`   | Focus after creation. Forced to `false` when `editable` is `false`.                                  |
| `editable`           | `boolean`                     | `true`    | Whether the content is editable.                                                                     |
| `enableInputRules`   | `boolean \| array`            | `true`    | Markdown input rules; pass an array of extension names to limit them.                                |
| `enablePasteRules`   | `boolean \| array`            | `true`    | Paste rules.                                                                                         |
| `enableContentCheck` | `boolean`                     | `false`   | Validate content against the schema (`contentError` event).                                          |
| `injectCSS`          | `boolean`                     | `true`    | Inject Tiptap's base CSS.                                                                            |
| `injectNonce`        | `string`                      | —         | Nonce for the injected `<style>` (CSP).                                                              |
| `editorProps`        | `object`                      | `{}`      | Raw ProseMirror `EditorProps`.                                                                       |
| `parseOptions`       | `object`                      | `{}`      | Options for `DOMParser`.                                                                             |
| `spellcheck`         | `boolean`                     | `false`   | Written into `editorProps.attributes.spellcheck`.                                                    |

::: tip
There is no `placeholder` prop. Placeholder text is configured through the
`Placeholder` extension (or through a kit):

```ts
RichTextKit.configure({ placeholder: { placeholder: 'Write something…' } })
```

:::

## Events

| Event               | Payload                   | Description                                   |
| ------------------- | ------------------------- | --------------------------------------------- |
| `update:modelValue` | `string \| object`        | Content changed (shape depends on `output`).  |
| `update`            | `{ output, editor }`      | Same moment as above, with the instance.      |
| `beforeCreate`      | `{ editor }`              | Before the view is created.                   |
| `create`            | `{ editor }`              | Editor ready (`v-model` already initialised). |
| `selectionUpdate`   | `{ editor }`              | Selection changed.                            |
| `transaction`       | `{ editor, transaction }` | Any transaction.                              |
| `focus`             | `{ editor, event }`       | Focus gained.                                 |
| `blur`              | `{ editor, event }`       | Focus lost.                                   |
| `destroy`           | —                         | Instance destroyed.                           |
| `contentError`      | `{ editor, error }`       | Content does not match the schema.            |
| `paste`             | `{ editor, event, … }`    | Paste happened.                               |
| `drop`              | `{ editor, event, … }`    | Drop happened.                                |

See [Events](../core/events) for details.

## Exposed members

```ts
expose({
  editor, // Editor instance (reactive subclass)
  isFocused, // boolean
  isEmpty, // boolean
  isCodeView, // boolean
  toggleCodeView, // () => void
})
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProseharborEditor, RichTextKit } from '@proseharbor-editor/vue3'

const editorRef = ref()
const extensions = [RichTextKit]

const focus = () => editorRef.value?.editor?.commands.focus('end')
const toggleSource = () => editorRef.value?.toggleCodeView()
</script>

<template>
  <button @click="focus">Focus</button>
  <button @click="toggleSource">Source</button>
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
</template>
```

::: warning
`editorRef.value.isCodeView` is a plain `boolean`, but
`editorRef.value.editor.isCodeView` is a `Ref` — remember `.value` there.
:::

## Slots

Only the **default** slot is supported, and it is rendered **outside** the
editable area and hidden while the HTML source view is active. Use it for menus
or your own footer:

```vue
<ProseharborEditor v-model="content" :extensions="extensions">
  <ProseharborEditorToolbar :editor="editorRef?.editor" />
</ProseharborEditor>
```

Rendered DOM:

```html
<div class="proseharbor-editor-editor-root">
  <div class="proseharbor-editor-prosemirror-wrapper"><!-- ProseMirror --></div>
  <!-- default slot -->
  <div class="proseharbor-editor-code-editor-wrapper"><!-- only in source view --></div>
</div>
```

## Reactive state

The `Editor` class exported from `@proseharbor-editor/vue3` keeps `state` and
`storage` in refs that are refreshed inside `beforeTransaction`. That is why
menus update automatically when the selection or content changes — you can rely
on the same mechanism in your own components:

```ts
import { computed } from 'vue'

const isBold = computed(() => editorRef.value?.editor?.isActive('bold'))
```

## Destroying

The component destroys the editor on unmount and before re-creating it when a
configuration change forces a rebuild. You normally do not need to call
`editor.destroy()` yourself.
