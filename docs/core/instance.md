# Instance

The `Editor` class is the heart of the editor. `@proseharbor-editor/core`
exports a subclass of Tiptap's `Editor` that adds the `proseharbor-editor` class
to the editable root:

```ts
// packages/core/src/editor.ts
export class Editor extends TipTap.Editor {
  constructor(options: Partial<EditorOptions> = {}) {
    super(options)
    return this
  }

  override prependClass(): void {
    this.view.dom.className = `${prefixClass} ${this.view.dom.className}`
  }
}
```

::: tip No factory function
There is **no** `createEditor()` helper — instantiate the class directly with
`new Editor(options)`.
:::

## Creating an instance

```ts
import { Editor, Document, Text, Paragraph, Bold } from '@proseharbor-editor/core'

const editor = new Editor({
  element: document.querySelector('#editor') as HTMLElement,
  content: '<p>Hello</p>',
  extensions: [Document, Text, Paragraph, Bold],
})
```

In Vue apps you normally let `<ProseharborEditor>` create the instance and grab
it from the template ref — see [Vue 3 / Editor component](../vue3/editor).

## Options

All options come from Tiptap's `EditorOptions` (re-exported by the core).

### Content & schema

| Option       | Type                                             | Default | Description                                                        |
| ------------ | ------------------------------------------------ | ------- | ------------------------------------------------------------------ |
| `element`    | `HTMLElement`                                    | —       | Mount point. Required for the core; the Vue component provides it. |
| `content`    | `string \| object \| array`                      | `''`    | Initial content — HTML string or ProseMirror JSON.                 |
| `extensions` | `AnyExtension[]`                                 | `[]`    | Nodes, marks and extensions making up the schema.                  |
| `editable`   | `boolean`                                        | `true`  | Whether the content can be edited.                                 |
| `autofocus`  | `boolean \| 'start' \| 'end' \| 'all' \| number` | `false` | Focus behaviour after creation.                                    |

::: warning
Only objects whose `type` is `extension`, `node` or `mark` survive the Vue
component's `extensions` prop filter; anything else is silently dropped.
:::

### Behaviour

| Option               | Type                  | Default | Description                                                               |
| -------------------- | --------------------- | ------- | ------------------------------------------------------------------------- |
| `editorProps`        | `object`              | `{}`    | Raw ProseMirror `EditorProps` (attributes, handlers …).                   |
| `parseOptions`       | `object`              | `{}`    | Options passed to `DOMParser`.                                            |
| `enableInputRules`   | `boolean \| string[]` | `true`  | Enable markdown style input rules, optionally limited to a list of names. |
| `enablePasteRules`   | `boolean \| string[]` | `true`  | Same for paste rules.                                                     |
| `enableContentCheck` | `boolean`             | `false` | Validate content against the schema and report through `onContentError`.  |
| `injectCSS`          | `boolean`             | `true`  | Inject Tiptap's minimal CSS (ProseMirror gap cursor etc.).                |
| `injectNonce`        | `string`              | —       | Nonce used for the injected `<style>` (CSP).                              |
| `spellcheck`         | `boolean`             | `false` | Vue-only prop, applied as `editorProps.attributes.spellcheck`.            |

### Event callbacks

See [Events](./events) for the complete list (`onUpdate`, `onCreate`, `onFocus`, …).

## Instance properties

| Property           | Type                  | Description                                      |
| ------------------ | --------------------- | ------------------------------------------------ |
| `view`             | `EditorView`          | The underlying ProseMirror view.                 |
| `state`            | `EditorState`         | Current editor state.                            |
| `schema`           | `Schema`              | Schema built from the extensions.                |
| `commands`         | `SingleCommands`      | All commands, callable directly.                 |
| `storage`          | `Record<string, any>` | Extension storage (`characterCount`, `toc`, …).  |
| `extensionManager` | `ExtensionManager`    | Registered extensions, their options and config. |
| `extensionStorage` | `Record<string, any>` | Alias of the extension storage.                  |
| `isEditable`       | `boolean`             | Whether the editor is editable.                  |
| `isEmpty`          | `boolean`             | Whether the document is empty.                   |
| `isFocused`        | `boolean`             | Whether the editor has focus.                    |
| `isDestroyed`      | `boolean`             | Whether the instance has been destroyed.         |

## Instance methods

### Content

| Method                                    | Description                                   |
| ----------------------------------------- | --------------------------------------------- |
| `getHTML()`                               | Serialise the document to an HTML string.     |
| `getJSON()`                               | Serialise the document to ProseMirror JSON.   |
| `getText(options?)`                       | Plain text, optionally with block separators. |
| `setContent(content, options?)`           | Replace the whole document.                   |
| `insertContent(value, options?)`          | Insert at the current selection.              |
| `insertContentAt(range, value, options?)` | Insert at a specific range.                   |
| `clearContent(emitUpdate?)`               | Empty the document.                           |

```ts
editor.commands.setContent('<p>Replaced</p>', { emitUpdate: false })
```

### Selection & state

| Method                                  | Description                                               |
| --------------------------------------- | --------------------------------------------------------- |
| `isActive(name, attrs?)`                | Whether a node/mark is active at the selection.           |
| `getAttributes(name)`                   | Attributes of the active node/mark.                       |
| `can()`                                 | Chainable helper to test whether a command would succeed. |
| `chain()` / `startChain()`              | Build a chain of commands, then `.run()`.                 |
| `focus(position?, options?)` / `blur()` | Manage DOM focus.                                         |
| `setEditable(editable, emitUpdate?)`    | Toggle editability.                                       |
| `getCharacterCount()`                   | Shortcut to the `characterCount` storage.                 |

### Plugins & lifecycle

| Method                                   | Description                                    |
| ---------------------------------------- | ---------------------------------------------- |
| `registerPlugin(plugin, handlePlugins?)` | Add a ProseMirror plugin.                      |
| `unregisterPlugin(nameOrPluginKey)`      | Remove a previously registered plugin.         |
| `on(event, cb)` / `off(event, cb)`       | Subscribe to / unsubscribe from editor events. |
| `destroy()`                              | Unmount and clean up.                          |
| `prependClass()`                         | Re-apply the `proseharbor-editor` root class.  |

## Vue 3 subclass

`@proseharbor-editor/vue3` exports its own `Editor` extending the core one with
reactive state, so menus re-render on every transaction:

```ts
export class Editor extends CoreEditor {
  contentComponent: AnyRecord | null
  appContext: AnyRecord | null
  reactiveState: Ref<EditorState>
  reactiveExtensionStorage: Ref<Record<string, any>>
}
```

- `state` and `storage` are overridden to return `Ref` values updated inside
  `beforeTransaction`, throttled with a double `requestAnimationFrame`.
- The instance is wrapped in `markRaw()`, so it is safe to keep in a `ref`.

The component also attaches a few helpers to the instance:

| Member                   | Type                                                   | Description                                                                  |
| ------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `uuid`                   | `string`                                               | Instance id.                                                                 |
| `getCharacters(params?)` | `() => { characters: number; words: number } \| Error` | Character / word count. Returns an `Error` when `CharacterCount` is missing. |
| `isCodeView`             | `Ref<boolean>`                                         | Whether the HTML source view is active (**a ref on the instance**).          |
| `toggleCodeView()`       | `() => void`                                           | Toggle between rich text and HTML source.                                    |
| `contentComponent`       | `object \| null`                                       | The Vue component instance that created the editor.                          |
| `appContext`             | `object \| null`                                       | Vue app context, used when rendering node views.                             |

::: warning
`editor.isCodeView` is a **ref** on the instance, but the value exposed by the
component is already unwrapped — `editorRef.value.isCodeView` is a plain
`boolean`.
:::

## Accessing the instance in Vue

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ProseharborEditor, RichTextKit } from '@proseharbor-editor/vue3'

const editorRef = ref()
const extensions = [RichTextKit]

onMounted(() => {
  const editor = editorRef.value.editor
  editor.chain().focus().toggleBold().run()
})
</script>

<template>
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
</template>
```

The component exposes:

```ts
expose({
  editor, // Editor instance
  isFocused, // boolean
  isEmpty, // boolean
  isCodeView, // boolean
  toggleCodeView,
})
```
