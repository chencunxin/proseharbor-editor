# Components

Besides the editor itself, `@proseharbor-editor/vue3` ships the menus and a set
of small UI building blocks.

```ts
import {
  ProseharborEditorToolbar,
  ProseharborEditorBubble,
  ProseharborEditorSlash,
  ProseharborEditorToc,
  NodeViewWrapper,
  NodeViewContent,
  IButton,
  ITooltip,
  ITrigger,
  IDivider,
  IColorPicker,
  IIcon,
} from '@proseharbor-editor/vue3'
```

Every menu component requires the `editor` instance as a prop.

## ProseharborEditorToolbar

```vue
<ProseharborEditorToolbar :editor="editor" :sort="toolbar" :code-view="isCodeView" />
```

### Props

| Prop       | Type      | Default             | Description                                                                      |
| ---------- | --------- | ------------------- | -------------------------------------------------------------------------------- |
| `editor`   | `object`  | **required**        | The editor instance.                                                             |
| `sort`     | `array`   | `TOOLBAR_MENU_SORT` | Menu order. Items are menu names (`'bold'`), `'                                  | '` for a divider, or menu objects. |
| `codeView` | `boolean` | `false`             | Whether the HTML source view is active (disables most buttons). Accepts a `Ref`. |

### Default order

```ts
const TOOLBAR_MENU_SORT = [
  'history',
  '|',
  'textClear',
  '|',
  'fontFamily',
  'fontSize',
  '|',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'subscript',
  'superscript',
  '|',
  'color',
  'background',
  'textAlign',
  'table',
  'link',
  'image',
  'codeBlock',
  '|',
  'bulletList',
  'orderedList',
  'taskList',
  '|',
  'blockquote',
  'hardBreak',
  'indent',
  'outdent',
  '|',
  'divider',
  '|',
  'codeView',
]
```

### How a menu name resolves

A string item is looked up in `editor.extensionManager.extensions` by name, and
the extension's **options** are spread into the menu object. So the look and
behaviour of a button comes from the extension configuration:

```ts
RichTextKit.configure({
  color: { type: 'picker' }, // colour button uses the full picker
})
```

Unknown names are dropped silently.

### Special items

| Item          | Behaviour                                               |
| ------------- | ------------------------------------------------------- |
| `'            | '`                                                      | Vertical `IDivider`. |
| `'textClear'` | `editor.chain().focus().unsetAllMarks().run()`.         |
| `'codeView'`  | Calls `editor.toggleCodeView()`.                        |
| `'history'`   | Group — renders `undo` / `redo` from its `list` option. |
| `'indent'`    | Group — renders `indent` / `outdent`.                   |

### Disabling rules

- In source view everything except `history` is disabled.
- Inside a code block everything except `history` is disabled.
- When an image node is selected, `textClear`, `table`, `hardBreak`, `divider`,
  `bulletList`, `orderedList`, `taskList` and `textAlign` are disabled.

### Slots

- `prefix` / `suffix` — receive `{ editor }`.
- A slot named after the menu overrides that button — receives
  `{ editor, ...menu }`.

```vue
<ProseharborEditorToolbar :editor="editor">
  <template #prefix="{ editor }">
    <span>{{ editor.storage.characterCount.words() }} words</span>
  </template>

  <template #bold="{ editor, command, isActive }">
    <button :class="{ active: isActive({ editor }) }" @click="command({ editor })">B</button>
  </template>
</ProseharborEditorToolbar>
```

### Custom menu objects

```ts
const toolbar = [
  'bold',
  '|',
  {
    name: 'highlight',
    desc: 'Highlight',
    command: ({ editor }) =>
      editor.chain().focus().toggleBackground({ background: '#fef08a' }).run(),
    isActive: ({ editor }) => editor.isActive('background', { background: '#fef08a' }),
    isDisabled: ({ editor }) => !editor.can().toggleBackground(),
    shortcutkeys: 'Mod-Shift-H',
  },
]
```

::: warning
`isActive` is called without a guard inside the bubble menu, so always provide
it when you add a custom item to `ProseharborEditorBubble`.
:::

## ProseharborEditorBubble

The floating toolbar shown on text selection.

```vue
<ProseharborEditorBubble :editor="editor" />
```

### Props

| Prop              | Type                 | Default                     | Description                                    |
| ----------------- | -------------------- | --------------------------- | ---------------------------------------------- |
| `editor`          | `object`             | **required**                | The editor instance.                           |
| `pluginKey`       | `string \| object`   | `'proseharborEditorBubble'` | Key of the registered ProseMirror plugin.      |
| `sort`            | `array`              | `BUBBLE_MENU_SORT`          | Menu order (same format as the toolbar).       |
| `updateDelay`     | `number`             | `60`                        | Delay in ms before the position is recomputed. |
| `appendTo`        | `function \| object` | `() => document.body`       | Where the floating element is appended.        |
| `floatingOptions` | `object`             | `{}`                        | Options for `@floating-ui/dom`.                |
| `shouldShow`      | `function \| null`   | `null`                      | Custom visibility predicate.                   |

### Default order

```ts
const BUBBLE_MENU_SORT = [
  'fontFamily',
  'fontSize',
  '|',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'color',
  'background',
  'link',
  'textAlign',
  '|',
  'textClear',
]
```

### Visibility

The default predicate hides the bubble when:

- the selection is empty or inside an empty text block,
- the cursor is inside a code block,
- a non-image node is selected.

A context specific selector is rendered: plain text, link, table or image.

```vue
<ProseharborEditorBubble
  :editor="editor"
  :should-show="({ editor }) => editor.isEditable && !editor.isActive('codeBlock')"
/>
```

Lifecycle: the plugin is registered on mount through
`editor.registerPlugin(BubbleMenuPlugin)` and removed with
`editor.unregisterPlugin(pluginKey)` on unmount, so you never need to add the
`BubbleMenu` extension manually.

## ProseharborEditorSlash

The `/` command menu renderer. You rarely use it directly — `NotionKit` wires it
up for you via `createSlashSuggestion()`.

### Props

| Prop      | Type       | Default      | Description                           |
| --------- | ---------- | ------------ | ------------------------------------- |
| `editor`  | `object`   | **required** | The editor instance.                  |
| `command` | `function` | **required** | Executed when an item is picked.      |
| `query`   | `string`   | `''`         | Current search query (after the `/`). |

### Exposed

`{ onKeyDown }` — forward the editor's key events to it.

### Making an extension appear in the slash menu

```ts
import { Blockquote } from '@proseharbor-editor/core'

Blockquote.configure({ slash: true, desc: '> quote' })
```

Candidates are computed from every extension whose options contain
`slash: true`; `heading` is expanded into one entry per level. Filtering matches
both the extension name and its translated label.

### Customising the suggestion

```ts
import { createSlashSuggestion, NotionKit } from '@proseharbor-editor/vue3'

const extensions = [
  NotionKit.configure({
    commandSlash: createSlashSuggestion({
      char: '/',
      tippyOptions: { placement: 'bottom-start' },
    }),
  }),
]
```

## ProseharborEditorToc

A table of contents generated from the headings.

```vue
<ProseharborEditorToc :editor="editor" :scroll-view="scrollViewEl" />
```

### Props

| Prop         | Type          | Default      | Description                                                                           |
| ------------ | ------------- | ------------ | ------------------------------------------------------------------------------------- |
| `editor`     | `object`      | **required** | The editor instance.                                                                  |
| `scrollView` | `HTMLElement` | `null`       | Scroll container used to compute which heading is active. Defaults to the editor DOM. |

Data comes from `editor.storage.toc.tocItems` (requires the `Toc` extension,
included in `RichTextKit` and `NotionKit`). Clicking an item scrolls smoothly to
the heading; while scrolling, the topmost visible heading is highlighted.

```ts
editor.commands.updateToc() // force a refresh
```

## Node views

Render a node with Vue:

```vue
<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@proseharbor-editor/vue3'

defineProps<{ node: any; updateAttributes: (attrs: any) => void }>()
</script>

<template>
  <NodeViewWrapper class="my-card">
    <span>Custom card</span>
    <NodeViewContent as="div" />
  </NodeViewWrapper>
</template>
```

```ts
import { VueNodeViewRenderer } from '@proseharbor-editor/vue3'
import CardView from './CardView.vue'

const Card = Node.create({
  name: 'card',
  group: 'block',
  content: 'inline*',
  addNodeView() {
    return VueNodeViewRenderer(CardView)
  },
})
```

::: warning
`NodeViewWrapper` **must** be the root element of a node view, otherwise
`VueNodeView` throws
`Please use the NodeViewWrapper component for your node view.`.
:::

| Component         | Props          | Slots   |
| ----------------- | -------------- | ------- |
| `NodeViewWrapper` | `as` (`'div'`) | default |
| `NodeViewContent` | `as` (`'div'`) | —       |

## UI components

| Component      | Props                                                                                   | Emits           | Slots                | Expose                                          |
| -------------- | --------------------------------------------------------------------------------------- | --------------- | -------------------- | ----------------------------------------------- |
| `IButton`      | `disabled`, `active`, `semiActive`, `danger`, `success`, `long` (all `boolean`)         | —               | `icon`, `default`    | —                                               |
| `ITooltip`     | `text`, `shortcutkeys`, `tippyOptions` (`{}`), `disabled`                               | —               | `default`            | `hide`, `show`, `enable`, `disable`, `setProps` |
| `ITrigger`     | `tippyOptions` (`{}`), `disabled`                                                       | —               | `default`, `content` | `hide`, `show`, `enable`, `disable`, `setProps` |
| `IDivider`     | `type` (`'horizontal'` / `'vertical'`), `dashed`                                        | —               | —                    | —                                               |
| `IColorPicker` | `defaultColorName`, `baseColorName`, `standardColorName`, `recentUseName`, `storageKey` | `change(color)` | —                    | —                                               |
| `IIcon`        | `name` (required), `size` (`'1em'`), `color` (`'currentColor'`)                         | —               | —                    | —                                               |

```vue
<ITooltip text="Bold" shortcutkeys="Mod-B">
  <IButton :active="isBold" @click="toggle">
    <IIcon name="bold" />
  </IButton>
</ITooltip>
```

Notes:

- `IButton` renders `type="button"` and calls `preventDefault()` on `mousedown`,
  so clicking it never steals the selection or submits a form.
- `IIcon` resolves `proseharbor-editor:{kebab-case-name}` from the bundled
  Iconify set.
- `IColorPicker` stores the recent colours in `localStorage` (max 9, SSR safe).

## Utilities

Re-exported helpers:

| Export                                                                                                                                                                           | Description                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `isMacOS`, `isArray`, `isObject`, `isString`, `isEmpty`                                                                                                                          | Type helpers.                               |
| `convertShortcutKeys(str)`                                                                                                                                                       | `'Mod-Shift-B'` → `'⌘⇧B'` / `'Ctrl⇧B'`.     |
| `createTippy(element, options)`                                                                                                                                                  | Create a tippy instance with sane defaults. |
| `getDefaultColors`, `getPickerStandardColors`, `getPickerColors`, `getPickerColorsFlat`, `getPickerColorsByShade`, `getPickerShadesByColor`, `getRecentColors`, `addRecentColor` | Colour palette helpers.                     |
| `toggleTheme`, `changeTheme`                                                                                                                                                     | Theme switching.                            |
| `convertToKebabCase`, `formatHTML`                                                                                                                                               | String / HTML formatting.                   |
| `sanitizeUrl`, `isSafeUrl`                                                                                                                                                       | URL safety checks (used by the link menu).  |
| `VueRenderer`, `VueNodeViewRenderer`                                                                                                                                             | Render Vue components into ProseMirror.     |

```ts
import { convertShortcutKeys, toggleTheme, sanitizeUrl } from '@proseharbor-editor/vue3'

convertShortcutKeys('Mod-Shift-B') // '⌘⇧B' on macOS
toggleTheme() // light <-> dark
sanitizeUrl('javascript:alert(1)') // blocked
```
