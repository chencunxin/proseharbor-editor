# Feature Extensions

Feature extensions add behaviour: plugins, global attributes, keyboard handling
or data exposed through `editor.storage`.

## Placeholder

```ts
import { Placeholder } from '@proseharbor-editor/core'
```

| Option                 | Type      | Default                           | Description                                  |
| ---------------------- | --------- | --------------------------------- | -------------------------------------------- |
| `placeholder`          | `string`  | `''`                              | Text shown when the editor is empty.         |
| `emptyEditorClass`     | `string`  | `'proseharbor-editor-empty'`      | Class on the editor when empty.              |
| `emptyNodeClass`       | `string`  | `'proseharbor-editor-node-empty'` | Class on the empty node.                     |
| `showOnlyCurrent`      | `boolean` | `true`                            | Only show it in the node holding the cursor. |
| `showOnlyWhenEditable` | `boolean` | `true`                            | Hide it in read-only mode.                   |

```ts
Placeholder.configure({ placeholder: 'Write something…' })
```

::: tip
There is no `placeholder` prop on the Vue component — always configure the
extension (or a kit): `RichTextKit.configure({ placeholder: { placeholder: '…' } })`.
:::

## History

Undo / redo, based on `prosemirror-history`.

| Option          | Type     | Default        | Description                                    |
| --------------- | -------- | -------------- | ---------------------------------------------- |
| `depth`         | `number` | `100`          | Number of kept history events.                 |
| `newGroupDelay` | `number` | `500`          | ms of inactivity that starts a new undo group. |
| `list`          | `array`  | `undo`, `redo` | Menu group.                                    |

| Command  | Description   |
| -------- | ------------- |
| `undo()` | Step back.    |
| `redo()` | Step forward. |

Shortcuts: `Mod-Z`, `Mod-Shift-Z`, `Mod-Y` (plus Cyrillic layout variants).

## Indent

Block level indentation for the configured node types.

| Option      | Type       | Default                    | Description                    |
| ----------- | ---------- | -------------------------- | ------------------------------ |
| `types`     | `string[]` | `['paragraph', 'heading']` | Nodes that accept indentation. |
| `minIndent` | `number`   | `0`                        | Minimum level.                 |
| `maxIndent` | `number`   | `7`                        | Maximum level.                 |
| `list`      | `array`    | `indent`, `outdent`        | Menu group.                    |

| Command     | Description            |
| ----------- | ---------------------- |
| `indent()`  | Increase by one level. |
| `outdent()` | Decrease by one level. |

The level is stored in an `indent` attribute and rendered as `data-indent`
(`sanitizeHtml` converts it to `padding-left: N*2em`). In lists, `Tab` is handled
by `ListItem` instead.

## CharacterCount

Re-export of `@tiptap/extensions`, used for word / character counters.

```ts
editor.storage.characterCount.characters()
editor.storage.characterCount.words()
```

With the Vue component you can also use the helper:

```ts
const { characters, words } = editor.getCharacters()
```

::: warning
`getCharacters()` **returns** an `Error` (does not throw) if `CharacterCount` is
not registered.
:::

## Dropcursor

Re-export of `@tiptap/extensions`. Shows where dragged content will land.

```ts
Dropcursor.configure({
  width: 5,
  color: 'rgba(var(--proseharbor-editor-theme-primary-val), 0.3)',
  class: 'proseharbor-editor-dropcursor',
})
```

## Gapcursor

Re-export of `@tiptap/extensions`. Provides a cursor for positions that are
otherwise unreachable (between a divider and a table, for example).

## Typography

Re-export of `@tiptap/extension-typography`: smart quotes, dashes, ellipsis,
etc. Disable it if you need byte-exact input.

```ts
BasicKit.configure({ typography: false })
```

## Selection

Keeps the selection visible when the editor loses focus, by decorating it with a
class.

| Option  | Type     | Default                           |
| ------- | -------- | --------------------------------- |
| `class` | `string` | `'proseharbor-editor__selection'` |

```ts
Selection.configure({ class: 'my-selection' })
```

## UniqueID

Gives every block a stable id, which is what the TOC uses to scroll to headings.

| Option              | Type                                  | Default         | Description                                   |
| ------------------- | ------------------------------------- | --------------- | --------------------------------------------- |
| `types`             | `string[]`                            | `['paragraph']` | Node types that receive an id.                |
| `attributeName`     | `string`                              | `'id'`          | Attribute name (rendered as `data-id`).       |
| `generateID`        | `() => string`                        | `uuidv4()`      | Id generator.                                 |
| `filterTransaction` | `(tr, oldState, newState) => boolean` | `null`          | Skip transactions you do not want to process. |

```ts
UniqueID.configure({
  types: ['heading', 'paragraph'],
  generateID: () => `block-${Math.random().toString(36).slice(2)}`,
})
```

Ids are assigned on create and repaired for changed ranges (duplicated ids are
regenerated).

## Toc

Collects the headings into a tree and keeps it up to date.

| Option        | Type       | Default              | Description                     |
| ------------- | ---------- | -------------------- | ------------------------------- |
| `levels`      | `number[]` | `[1, 2, 3, 4, 5, 6]` | Heading levels to include.      |
| `headingType` | `string`   | `'heading'`          | Node type treated as a heading. |

```ts
interface TocItem {
  level: number
  text: string
  pos: number
  id: string | null
  children: TocItem[]
}
```

```ts
editor.storage.toc.tocItems // TocItem[]
editor.commands.updateToc() // force a refresh
```

The TOC is refreshed automatically when a heading changes, and on create. Pair it
with `UniqueID` so items have ids, and with `<ProseharborEditorToc>` to render.

## BubbleMenu

Re-export of `@tiptap/extension-bubble-menu` (`BubbleMenu` + `BubbleMenuPlugin`).

You rarely register it yourself: `<ProseharborEditorBubble>` calls
`editor.registerPlugin(BubbleMenuPlugin)` on mount and
`editor.unregisterPlugin(pluginKey)` on unmount.

```ts
import { BubbleMenu, BubbleMenuPlugin } from '@proseharbor-editor/core'
```

## CommandSlash

The `/` command menu, built on `@tiptap/suggestion`.

| Option               | Type     | Default                                                          |
| -------------------- | -------- | ---------------------------------------------------------------- |
| `suggestion.char`    | `string` | `'/'`                                                            |
| `suggestion.command` | `fn`     | `({ editor, range, props }) => props.command({ editor, range })` |
| `suggestion.items`   | `fn`     | `() => []` (candidates come from the Vue component)              |
| `suggestion.render`  | `fn`     | `() => ({})`                                                     |

`NotionKit` wires it up with `createSlashSuggestion()`.

```ts
import { createSlashSuggestion, NotionKit } from '@proseharbor-editor/vue3'

NotionKit.configure({
  commandSlash: createSlashSuggestion({ char: '/', tippyOptions: { placement: 'bottom-start' } }),
})
```

Candidates are every extension with `slash: true` in its options; `Heading`
expands to one entry per level.

## CommandAKeymap

Makes `Mod-A` select the text of the current node instead of the whole document,
then the whole document on a second press.

Command: `selectTextWithinNodeBoundaries()`.

## DragHandle

Renders a handle to the left of the hovered block so it can be dragged.

| Option        | Type     | Default               |
| ------------- | -------- | --------------------- |
| `handleId`    | `string` | `'editor-handle'`     |
| `handleBarId` | `string` | `'editor-handle-bar'` |

The DOM (`#editor-handle` > `#editor-handle-bar`) and its style tag are created in
`onBeforeCreate` and appended to `document.body`, so only one handle exists even
with several editors.

```ts
DragHandle.configure({ handleId: 'my-handle', handleBarId: 'my-handle-bar' })
```
