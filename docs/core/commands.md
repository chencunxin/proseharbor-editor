# Commands

Commands are Tiptap commands. There is no separate `run()` / `toggleBold()`
helper export — you call commands on the editor instance.

## Three ways to run a command

```ts
// 1. directly (no focus handling)
editor.commands.toggleBold()

// 2. through a chain (recommended: keeps focus + multiple commands)
editor.chain().focus().toggleBold().setColor('#ff0000').run()

// 3. conditionally
editor.can().toggleBold() // boolean
```

`editor.chain().focus().…​.run()` is what the built-in menus use, because it
restores the selection after clicking a button.

## Commands added by the built-in extensions

### Blocks

| Command                    | Source        | Description                               |
| -------------------------- | ------------- | ----------------------------------------- |
| `setParagraph()`           | `Paragraph`   | Convert the current block to a paragraph. |
| `setHeading({ level })`    | `Heading`     | Convert to a heading (`level` 1–6).       |
| `toggleHeading({ level })` | `Heading`     | Toggle between heading and paragraph.     |
| `setBlockquote()`          | `Blockquote`  | Convert to a blockquote.                  |
| `toggleBlockquote()`       | `Blockquote`  | Toggle a blockquote.                      |
| `unsetBlockquote()`        | `Blockquote`  | Convert back to a paragraph.              |
| `setDivider()`             | `Divider`     | Insert a horizontal rule at top level.    |
| `setHardBreak()`           | `HardBreak`   | Insert a line break.                      |
| `toggleCodeBlock()`        | `CodeBlock`   | Toggle a fenced code block.               |
| `toggleBulletList()`       | `BulletList`  | Toggle a bullet list.                     |
| `toggleOrderedList()`      | `OrderedList` | Toggle an ordered list.                   |
| `toggleTaskList()`         | `TaskList`    | Toggle a task list.                       |
| `splitListItem(name)`      | `ListItem`    | Split the current list item.              |
| `sinkListItem(name)`       | `ListItem`    | Nest the item (Tab).                      |
| `liftListItem(name)`       | `ListItem`    | Un-nest the item (Shift-Tab).             |

### Text style

| Command                        | Source       | Description                              |
| ------------------------------ | ------------ | ---------------------------------------- |
| `setColor(color)`              | `Color`      | Set the text color.                      |
| `unsetColor()`                 | `Color`      | Remove the text color.                   |
| `setBackground(attributes)`    | `Background` | Set the highlight color.                 |
| `toggleBackground(attributes)` | `Background` | Toggle the highlight color.              |
| `unsetBackground()`            | `Background` | Remove the highlight.                    |
| `setFontFamily(fontFamily)`    | `FontFamily` | Set the font family.                     |
| `unsetFontFamily()`            | `FontFamily` | Reset the font family.                   |
| `setFontSize(fontSize)`        | `FontSize`   | Set the font size.                       |
| `unsetFontSize()`              | `FontSize`   | Reset the font size.                     |
| `setTextAlign(alignment)`      | `TextAlign`  | `left` / `center` / `right` / `justify`. |
| `unsetTextAlign()`             | `TextAlign`  | Reset to `defaultAlignment`.             |
| `removeEmptyTextStyle()`       | `TextStyle`  | Drop an empty `textStyle` mark.          |

### Marks, links, images

| Command                     | Source        | Description                               |
| --------------------------- | ------------- | ----------------------------------------- |
| `toggleBold()`              | `Bold`        |                                           |
| `toggleItalic()`            | `Italic`      |                                           |
| `toggleUnderline()`         | `Underline`   |                                           |
| `toggleStrike()`            | `Strike`      |                                           |
| `toggleCode()`              | `Code`        | Inline code.                              |
| `toggleSuperscript()`       | `Superscript` |                                           |
| `toggleSubscript()`         | `Subscript`   |                                           |
| `setLink({ href, target })` | `Link`        | Apply a link mark.                        |
| `unsetLink()`               | `Link`        | Remove the link mark.                     |
| `setImage(attrs)`           | `Image`       | Insert an image.                          |
| `updateImage(attrs)`        | `Image`       | Update the selected image.                |
| `unsetAllMarks()`           | Tiptap        | Remove every mark (the `textClear` menu). |

### Table, TOC, history, indentation

| Command                                      | Source           | Description                                  |
| -------------------------------------------- | ---------------- | -------------------------------------------- |
| `insertTable({ rows, cols, withHeaderRow })` | `Table`          | Insert a table.                              |
| `addColumnBefore()` / `addColumnAfter()`     | `Table`          | Column operations (also `deleteColumn`).     |
| `addRowBefore()` / `addRowAfter()`           | `Table`          | Row operations (also `deleteRow`).           |
| `mergeCells()` / `splitCell()`               | `Table`          | Merge / split cells.                         |
| `toggleHeaderRow()` / `toggleHeaderColumn()` | `Table`          | Header row / column.                         |
| `deleteTable()`                              | `Table`          | Remove the whole table.                      |
| `updateToc()`                                | `Toc`            | Recompute `editor.storage.toc.tocItems`.     |
| `undo()` / `redo()`                          | `History`        | Undo / redo.                                 |
| `indent()` / `outdent()`                     | `Indent`         | Change the block indentation.                |
| `selectTextWithinNodeBoundaries()`           | `CommandAKeymap` | Select the text of the current node (Mod-A). |

## Menu metadata on extensions

Every built-in extension also exposes a **menu descriptor** in its options. That
is what the toolbar, bubble menu and slash menu render:

```ts
interface ExtensionMeta {
  name?: string
  desc?: string
  icon?: string
  group?: string
  slash?: boolean // appears in the "/" menu
  command?: (context: { editor: Editor; range?: any; [key: string]: any }) => boolean | void
  isActive?: (context: { editor: Editor }) => boolean
  isDisabled?: (context: { editor: Editor }) => boolean
  shortcutkeys?: string | string[]
  sort?: number
}
```

So calling a menu action is the same as calling `options.command`:

```ts
const bold = editor.extensionManager.extensions.find((ext) => ext.name === 'bold')

bold?.options.command?.({ editor }) // === editor.chain().focus().toggleBold().run()
bold?.options.isActive?.({ editor }) // boolean
```

`Heading`, `TextAlign`, `History` and `Indent` are **groups**: their `list`
option holds one descriptor per button.

```ts
Heading.configure({
  list: [{ name: 'heading1', command: ({ editor }) => editor.commands.setHeading({ level: 1 }) }],
})
```

## Keyboard shortcuts

| Shortcut                    | Action                               | Extension               |
| --------------------------- | ------------------------------------ | ----------------------- |
| `Mod-B`                     | Bold                                 | `Bold`                  |
| `Mod-I`                     | Italic                               | `Italic`                |
| `Mod-U`                     | Underline                            | `Underline`             |
| `Mod-Shift-S`               | Strike                               | `Strike`                |
| `Mod-E`                     | Inline code                          | `Code`                  |
| `Mod-.`                     | Superscript                          | `Superscript`           |
| `Mod-,`                     | Subscript                            | `Subscript`             |
| `Mod-Shift-H`               | Highlight                            | `Background`            |
| `Mod-Alt-0`                 | Paragraph                            | `Paragraph`             |
| `Mod-Alt-1` … `6`           | Heading 1 … 6                        | `Heading`               |
| `Mod-Shift-8`               | Bullet list                          | `BulletList`            |
| `Mod-Shift-7`               | Ordered list                         | `OrderedList`           |
| `Mod-Shift-9`               | Task list                            | `TaskList`              |
| `Mod-Shift-B`               | Blockquote                           | `Blockquote`            |
| `Mod-Shift-C`               | Code block                           | `CodeBlock`             |
| `Mod-Enter` / `Shift-Enter` | Line break                           | `HardBreak`             |
| `Mod-Shift-L`               | Align left                           | `TextAlign`             |
| `Mod-Shift-E`               | Align center                         | `TextAlign`             |
| `Mod-Shift-R`               | Align right                          | `TextAlign`             |
| `Mod-Shift-J`               | Justify                              | `TextAlign`             |
| `Mod-Z` / `Mod-Shift-Z`     | Undo / redo                          | `History`               |
| `Tab` / `Shift-Tab`         | Indent / outdent (lists, code block) | `ListItem`, `CodeBlock` |
| `Mod-A`                     | Select text of the current node      | `CommandAKeymap`        |

`Mod` is `⌘` on macOS and `Ctrl` elsewhere. Display strings are produced by
`convertShortcutKeys()`, which also translates `Shift` → `⇧`, `Alt` → `⌥`,
`Enter` → `↵`, `Backspace` → `⌫`.

```ts
import { convertShortcutKeys } from '@proseharbor-editor/vue3'

convertShortcutKeys('Mod-Shift-B') // '⌘⇧B' on macOS, 'Ctrl⇧B' elsewhere
```

## Custom commands

Add your own by extending an extension, or simply execute them yourself:

```ts
import { Extension } from '@proseharbor-editor/core'

const ClearFormatting = Extension.create({
  name: 'clearFormatting',
  addOptions() {
    return {
      name: 'clearFormatting',
      desc: 'Clear all marks',
      slash: true,
      command: ({ editor }) => editor.chain().focus().unsetAllMarks().run(),
      isActive: () => false,
      isDisabled: ({ editor }) => !editor.can().unsetAllMarks(),
      shortcutkeys: 'Mod-Shift-X',
    }
  },
  addCommands() {
    return {
      clearFormatting:
        () =>
        ({ chain }) =>
          chain().focus().unsetAllMarks().run(),
    }
  },
})
```

See [Custom extensions](../extensions/custom) for the full walkthrough.
