# Custom Extensions

Because the project is built on Tiptap, a custom extension is a regular Tiptap
extension (`Node.create` / `Mark.create` / `Extension.create`).

To make it appear in a menu, provide the **menu metadata** in its `options` —
all three menus read from it:

| Entry point | How it shows up                                      | Required options                    |
| ----------- | ---------------------------------------------------- | ----------------------------------- |
| Toolbar     | list the name in `ProseharborEditorToolbar`'s `sort` | `name` + `command`                  |
| Bubble menu | list the name in `ProseharborEditorBubble`'s `sort`  | `name` + `command` + **`isActive`** |
| Slash menu  | collected automatically                              | `slash: true`                       |

> `sort` is a whitelist: an extension that is not listed is not rendered.
> Passing a custom `sort` replaces the built-in default list entirely, so you
> have to repeat every button you want to keep (see [toolbar](#adding-a-button-to-the-toolbar)).

## Menu metadata

```ts
interface MenuMeta {
  name: string                                    // unique id: icon name + i18n key + slot name
  desc?: string                                   // description (reserved, not rendered today)
  slash?: boolean                                 // show up in the "/" menu
  command: (ctx: { editor, range?, ...args }) => boolean | void
  isActive?: (ctx: { editor }) => boolean          // required for bubble menu entries
  isDisabled?: (ctx: { editor }) => boolean        // optional, usually !editor.can().xxx()
  shortcutkeys?: string | string[]                 // display only
  list?: MenuMeta[]                                // grouped menu (several buttons)
}
```

Conventions:

- `name` must match the extension name — the toolbar and bubble menu look the
  extension up by it.
- When called from the slash menu, `command` receives an extra `range` (the range
  of the typed `/xxx`); delete it before inserting, otherwise the keyword stays in
  the document.
- `shortcutkeys` is **only a hint on the menu**; register the real binding in
  `addKeyboardShortcuts()`.
- `desc` is not rendered — the slash menu renders `t(name)`.

## A minimal mark

```ts
import { Mark, mergeAttributes } from '@proseharbor-editor/core'
import type { CommandProps } from '@proseharbor-editor/core'

// Custom commands need a type declaration, otherwise
// editor.commands.toggleHighlight() is a type error.
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      toggleHighlight: () => ReturnType
    }
  }
}

export const Highlight = Mark.create({
  name: 'highlight',

  addOptions() {
    return {
      // ---- menu metadata ----
      name: 'highlight',
      desc: 'Highlight the selection',
      slash: true,
      // the built-in background extension already uses Mod-Shift-H
      shortcutkeys: 'Mod-Alt-H',
      command: ({ editor, range }) =>
        range
          ? editor.chain().focus().deleteRange(range).toggleHighlight().run()
          : editor.chain().focus().toggleHighlight().run(),
      isActive: ({ editor }) => editor.isActive('highlight'),
      isDisabled: ({ editor }) => !editor.can().toggleHighlight(),
      // -----------------------
      HTMLAttributes: {
        class: 'custom-highlight',
        // the built-in background extension also renders <mark>
        'data-type': 'highlight',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'mark[data-type="highlight"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleHighlight:
        () =>
        // annotate the props when noImplicitAny is enabled
        ({ commands }: CommandProps) =>
          commands.toggleMark(this.name),
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-h': () => this.editor.commands.toggleHighlight(),
    }
  },
})
```

Use it like any other extension:

```ts
const extensions = [RichTextKit, Highlight]
```

::: warning
Two common pitfalls:

1. The built-in `background` extension also renders `<mark>`, so a custom
   `parseHTML` of `{ tag: 'mark' }` makes the two marks swallow each other when
   parsing HTML. Use an attribute selector to disambiguate.
2. Do not reuse a shortcut that a built-in extension already owns
   (`background` uses `Mod-Shift-H`).
   :::

## A node with attributes

```ts
import { Node, mergeAttributes } from '@proseharbor-editor/core'
import { prefixClass } from '@proseharbor-editor/core'
import type { CommandProps } from '@proseharbor-editor/core'

export type CalloutVariant = 'info' | 'warning' | 'danger'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      toggleCallout: (attributes?: { variant?: CalloutVariant }) => ReturnType
    }
  }
}

export const Callout = Node.create({
  name: 'callout',

  addOptions() {
    return {
      name: 'callout',
      desc: 'Callout',
      slash: true,
      command: ({ editor, range }) =>
        range
          ? editor.chain().focus().deleteRange(range).toggleCallout().run()
          : editor.chain().focus().toggleCallout().run(),
      isActive: ({ editor }) => editor.isActive('callout'),
      isDisabled: ({ editor }) => !editor.can().toggleCallout(),
      HTMLAttributes: { class: `${prefixClass}__callout` },
    }
  },

  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info' as CalloutVariant,
        parseHTML: (element) => (element.getAttribute('data-variant') as CalloutVariant) ?? 'info',
        renderHTML: (attributes) => ({ 'data-variant': attributes.variant }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-type': 'callout' }, this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      toggleCallout:
        (attributes = {}) =>
        ({ commands }: CommandProps) =>
          commands.toggleWrap(this.name, attributes),
    }
  },
})
```

::: tip
`range` is passed by the slash menu: delete it before inserting so the typed
`/callout` text disappears.
:::

::: warning
**Non-textblock nodes cannot be inserted with `commands.setNode()`** — tiptap logs
`Currently "setNode()" only supports text block nodes.` and returns `false`.
For container nodes (`content: 'block+'`) use `wrapIn` / `lift` / `toggleWrap`
(wrap the current block / lift it out / toggle). `setNode()` only works for
textblocks such as `heading` (`content: 'inline*'`).
:::

## A node view rendered with Vue

```vue
<!-- CalloutView.vue -->
<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@proseharbor-editor/vue3'

const props = defineProps<{ node: any; updateAttributes: (attrs: any) => void }>()
</script>

<template>
  <NodeViewWrapper :data-variant="node.attrs.variant" class="callout">
    <select
      :value="node.attrs.variant"
      @change="updateAttributes({ variant: ($event.target as HTMLSelectElement).value })"
    >
      <option value="info">Info</option>
      <option value="warning">Warning</option>
    </select>
    <NodeViewContent />
  </NodeViewWrapper>
</template>
```

```ts
import { VueNodeViewRenderer } from '@proseharbor-editor/vue3'
import CalloutView from './CalloutView.vue'

Callout.configure({ nodeView: VueNodeViewRenderer(CalloutView) })
```

::: warning
`NodeViewWrapper` must be the root element — `VueNodeView` throws otherwise.
:::

## Adding a button to the toolbar

The toolbar resolves a string entry by extension name and spreads the extension
options, so an extension with a `command` is enough:

```ts
const toolbarSort = ['bold', 'italic', '|', 'highlight']
```

```vue
<ProseharborEditorToolbar :editor="editor" :sort="toolbarSort" />
```

`sort` accepts three kinds of entries:

| Entry                         | Meaning                                                     |
| ----------------------------- | ----------------------------------------------------------- |
| `'bold'`                      | string: find the extension by `name` and spread its options |
| `'                            | '`                                                          | vertical divider |
| `{ name, command, isActive }` | object: inline menu item, no extension needed               |

Or pass an object directly:

```ts
const toolbarSort = [
  'bold',
  {
    name: 'callout',
    command: ({ editor }) => editor.chain().focus().toggleCallout().run(),
    isActive: ({ editor }) => editor.isActive('callout'),
    isDisabled: ({ editor }) => !editor.can().toggleCallout(),
  },
]
```

Notes:

- The default `sort` is a built-in constant (history, fonts, alignment, table, …);
  passing your own array replaces it completely.
- A string that matches no extension is silently ignored.
- `link`, `textAlign`, `color`, `background`, `fontFamily`, `fontSize`, `table`,
  `image` and `codeView` are rendered by dedicated components (dropdowns /
  popovers) — avoid these names for your own extensions.
- Grouped entries such as `history` and `indent` need a `list` array, see
  [group menus](#group-menus).
- In code view, or when the cursor is inside a code block, every button except
  `history` / `codeView` is disabled automatically.

You can also override the rendered button with a slot named after the menu
(supported by both the toolbar and the bubble menu):

```vue
<ProseharborEditorToolbar :editor="editor">
  <template #callout="{ editor, command, isActive }">
    <button :class="{ active: isActive({ editor }) }" @click="command({ editor })">Callout</button>
  </template>
</ProseharborEditorToolbar>
```

Slot props are `{ editor, ...menuItem }`; `#prefix` / `#suffix` insert content at
both ends.

## Adding an entry to the bubble menu

Exactly the same, only the component changes:

```vue
<ProseharborEditorBubble :editor="editor" :sort="['bold', 'italic', '|', 'highlight', 'callout']" />
```

::: warning
The default bubble renderer calls `menu.isActive({ editor })` **without optional
call protection**, so `isActive` is **mandatory** for bubble menu entries —
otherwise rendering throws. The toolbar tolerates a missing `isActive`.
:::

The base bubble menu only shows for text selections (not link / table / image
selections, which have their own panels).

## Showing up in the slash menu

Set `slash: true` — the `/` menu collects every extension whose `options.slash` is
truthy, no `sort` needed.

```ts
Callout.configure({ slash: true, desc: 'Callout block' })
```

The slash menu needs the `CommandSlash` extension for the suggestion behaviour:

- `NotionKit` already includes it, so
  `NotionKit.configure({ commandSlash: createSlashSuggestion() })` is enough;
- **`RichTextKit` does not include `commandSlash`**, register it yourself:

```ts
import { CommandSlash } from '@proseharbor-editor/core'
import { RichTextKit, createSlashSuggestion } from '@proseharbor-editor/vue3'

const extensions = [
  RichTextKit.configure({ placeholder: { placeholder: 'Type / for commands' } }),
  CommandSlash.configure(createSlashSuggestion()),
  Highlight,
  Callout,
]
```

Filtering matches the extension name and the translated label
(`item.name.includes(query) || t(item.name).includes(query)`), so add the key to
your locale if you want it searchable in another language:

```ts
import { addLocale } from '@proseharbor-editor/core'

addLocale('en', { callout: 'Callout' })
```

::: tip
A slash item renders `{ icon, t(name), shortcutkeys }` — `desc` is not used.
Extensions with a `list` (like `heading`) are expanded into several items.
:::

## Setting the icon

The toolbar, bubble menu and slash menu all render icons with the built-in `IIcon`
component, which **always resolves `name` to `proseharbor-editor:{kebab-case name}`**
in the bundled Iconify collection:

| Menu name     | Icon actually requested           |
| ------------- | --------------------------------- |
| `highlight`   | `proseharbor-editor:highlight`    |
| `myHighlight` | `proseharbor-editor:my-highlight` |
| `codeView`    | `proseharbor-editor:code-view`    |

The bundled collection only covers built-in extensions, so **a custom extension
must register its own icon under that name, otherwise the button is blank** (no
error is thrown, nothing is rendered). The `icon` field of the menu metadata is
not used.

### Registering icons

Use `addIcon` / `addCollection` from `@iconify/vue` with the same prefix and a
24×24 SVG body:

```ts
// icons.ts — run once before rendering (module top-level, or import in main.ts)
import { addIcon } from '@iconify/vue'

export const ICON_PREFIX = 'proseharbor-editor'

addIcon(`${ICON_PREFIX}:highlight`, {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 11 6-6 3 3-6 6H9zM5 15l4-4"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M3 21h18"/>',
  width: 24,
  height: 24,
})

addIcon(`${ICON_PREFIX}:callout`, {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5h16v14H4zM8 9h8M8 13h5"/>',
  width: 24,
  height: 24,
})
```

Bulk registration is handy when you have many icons:

```ts
import { addCollection } from '@iconify/vue'

addCollection({
  prefix: 'proseharbor-editor',
  icons: {
    highlight: { body: '...', width: 24, height: 24 },
    callout: { body: '...', width: 24, height: 24 },
  },
})
```

Once registered, the icon is picked up by the toolbar, bubble menu and slash menu
automatically — no extra props.

::: tip
`@iconify/vue` is a dependency of `@proseharbor-editor/vue3`; install the same
version in your app if you want to reference it directly. Icon data may come from
any Iconify set — just copy the `body` and register it under the
`proseharbor-editor` prefix.
:::

### Custom icon via slot

If you do not want to depend on the icon set, take over rendering with a named
slot; the icon can be any SVG, component or plain text:

```vue
<ProseharborEditorToolbar :editor="editor" :sort="toolbarSort">
  <template #callout="{ editor, command, isActive }">
    <IButton :active="isActive({ editor })" @click="command({ editor })">
      <svg viewBox="0 0 24 24" width="14" height="14">
        <path fill="none" stroke="currentColor" stroke-width="2" d="M4 5h16v14H4zM8 9h8" />
      </svg>
    </IButton>
  </template>
</ProseharborEditorToolbar>
```

`IButton`, `ITooltip`, `IIcon` and friends are exported from
`@proseharbor-editor/vue3`, so you keep the built-in active state, tooltip and
shortcut hint.

## Labels and i18n

Menu titles and tooltips go through `t(name)`, falling back to the raw `name`
when the key is missing. Add your labels:

```ts
import { addLocale } from '@proseharbor-editor/core'

addLocale('en', { highlight: 'Highlight', callout: 'Callout' })
addLocale('zh', { highlight: '高亮', callout: '提示块' })
```

## Group menus

Extensions such as `Heading`, `TextAlign`, `History` and `Indent` expose a `list`
of menu items, which the toolbar renders as several buttons:

```ts
const ClearGroup = Extension.create({
  name: 'clearGroup',
  addOptions() {
    return {
      name: 'clearGroup',
      list: [
        {
          name: 'clearMarks',
          command: ({ editor }) => editor.chain().focus().unsetAllMarks().run(),
          isActive: () => false,
        },
        {
          name: 'clearNodes',
          command: ({ editor }) => editor.chain().focus().clearNodes().run(),
          isActive: () => false,
        },
      ],
    }
  },
})
```

Then reference `'clearGroup'` in `sort`. Each entry's `name` again determines its
icon and label key (`proseharbor-editor:clear-marks`, `t('clearMarks')`).

## Wrapping extensions in your own kit

```ts
import { Extension } from '@proseharbor-editor/core'
import { RichTextKit } from '@proseharbor-editor/vue3'

export const MyKit = RichTextKit.extend({
  name: 'myKit',
  addExtensions() {
    return [...(this.parent?.() ?? []), Highlight, Callout]
  },
})
```

Then `MyKit.configure({ heading: { levels: [1, 2, 3] } })` still works, and your
extensions are part of every editor that uses the kit.

## Full example

A runnable example lives in `playground/src/views/custom-extension-page/`
(visit `/custom-extension`):

```
extensions/highlight.ts   # custom mark: toolbar + bubble menu + slash menu
extensions/callout.ts     # custom node: attributes, wraps blocks
extensions/icons.ts       # registering custom icons
extensions/index.ts       # registering i18n labels
custom-extension-page.vue # wiring: sort / slots / CommandSlash
```

## Checklist

- [ ] `name` — unique, also used as the icon / i18n / slot name.
- [ ] `command` — receives `{ editor, range?, ...args }`; delete `range` in the
      slash menu.
- [ ] `isActive` — **required** for bubble menu entries.
- [ ] `isDisabled` — optional, use `editor.can().…`.
- [ ] `shortcutkeys` — display only; register the real binding in
      `addKeyboardShortcuts()` and avoid clashes with built-ins.
- [ ] `slash: true` + `desc` — to appear in the `/` menu (make sure `CommandSlash`
      is enabled).
- [ ] Register the icon as `proseharbor-editor:{kebab-case name}`, or override the
      rendering with a slot.
- [ ] Add the label to your locale bundle.
- [ ] List the name in the toolbar / bubble menu `sort`.

## Troubleshooting

| Symptom                                | Cause                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| Blank button                           | icon not registered, or not registered in kebab-case (`myHighlight` → `my-highlight`) |
| Button never appears                   | not listed in `sort`, or the string does not match the extension `name`               |
| Bubble menu throws / never highlights  | menu item has no `isActive`                                                           |
| Slash menu never opens                 | `CommandSlash` not enabled (register it yourself with `RichTextKit`)                  |
| Click does nothing                     | the command returns `false`; commonly `setNode()` on a non-textblock node             |
| The typed `/xxx` stays in the document | `command` does not call `deleteRange(range)`                                          |
| Custom mark looks wrong                | clashes with the built-in `background` `<mark>`; use an attribute selector            |
