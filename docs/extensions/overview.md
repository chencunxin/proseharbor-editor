# Extensions Overview

Everything the editor can do comes from an extension: a **node** (block or
inline element), a **mark** (inline formatting) or a plain **extension**
(behaviour, plugins, global attributes).

All extensions are exported from `@proseharbor-editor/core` and are written with
the Tiptap `Node.create` / `Mark.create` / `Extension.create` API.

```ts
import { Bold, Heading, Placeholder } from '@proseharbor-editor/core'
```

## Using extensions

```ts
import { Editor, Document, Text, Paragraph, Bold, Italic } from '@proseharbor-editor/core'

const editor = new Editor({
  element: document.querySelector('#editor') as HTMLElement,
  extensions: [Document, Text, Paragraph, Bold, Italic],
})
```

Most of the time you will use a [kit](../kit/basic) instead — a kit is just an
extension that bundles other extensions.

## Configuring

```ts
Heading.configure({ levels: [1, 2, 3] })
```

Kits accept one option per bundled extension, and `false` removes it:

```ts
RichTextKit.configure({
  heading: { levels: [1, 2, 3] },
  table: false,
})
```

## Menu metadata

Every bundled extension carries a **menu descriptor** in its options, which the
toolbar, bubble menu and slash menu read:

```ts
interface ExtensionMeta {
  name?: string                       // i18n key + icon name + slot name
  desc?: string                       // hint shown in the slash menu
  icon?: string
  group?: string
  slash?: boolean                     // show in the "/" menu
  command?: (ctx: { editor, range?, ...args }) => boolean | void
  isActive?: (ctx: { editor }) => boolean
  isDisabled?: (ctx: { editor }) => boolean
  shortcutkeys?: string | string[]
  sort?: number
}
```

Because a toolbar entry is resolved by looking up the extension of the same name
and spreading its options, configuring an extension also configures its button.

```ts
RichTextKit.configure({
  color: { type: 'picker' }, // the colour button now opens the full picker
})
```

## Full list

### Nodes

| Extension                            | Summary                              |
| ------------------------------------ | ------------------------------------ |
| [`Document`](./nodes#document)       | Root node, optional `title` block.   |
| [`Text`](./nodes#text)               | Text node.                           |
| [`Paragraph`](./nodes#paragraph)     | Paragraph block.                     |
| [`Heading`](./nodes#heading)         | Headings 1–6.                        |
| [`HardBreak`](./nodes#hardbreak)     | Line break.                          |
| [`Blockquote`](./nodes#blockquote)   | Quote block.                         |
| [`Divider`](./nodes#divider)         | Horizontal rule.                     |
| [`BulletList`](./nodes#bulletlist)   | Unordered list.                      |
| [`OrderedList`](./nodes#orderedlist) | Ordered list.                        |
| [`ListItem`](./nodes#listitem)       | List item shared by both list types. |
| [`TaskList`](./nodes#tasklist)       | Checkbox list.                       |
| [`CodeBlock`](./nodes#codeblock)     | Fenced code block.                   |
| [`Image`](./nodes#image)             | Inline / block image with resize.    |
| [`Table`](./nodes#table)             | Resizable table.                     |

### Marks

| Extension                            | Summary                     |
| ------------------------------------ | --------------------------- |
| [`Bold`](./marks#bold)               | Strong.                     |
| [`Italic`](./marks#italic)           | Emphasis.                   |
| [`Underline`](./marks#underline)     | Underline.                  |
| [`Strike`](./marks#strike)           | Strikethrough.              |
| [`Code`](./marks#code)               | Inline code.                |
| [`Subscript`](./marks#subscript)     | Subscript.                  |
| [`Superscript`](./marks#superscript) | Superscript.                |
| [`Link`](./marks#link)               | Hyperlink.                  |
| [`TextStyle`](./marks#textstyle)     | Base mark for text styling. |
| [`Color`](./marks#color)             | Text colour.                |
| [`Background`](./marks#background)   | Highlight colour.           |
| [`FontFamily`](./marks#fontfamily)   | Font family.                |
| [`FontSize`](./marks#fontsize)       | Font size.                  |
| [`TextAlign`](./marks#textalign)     | Alignment (global attr).    |

### Features

| Extension                                     | Summary                              |
| --------------------------------------------- | ------------------------------------ |
| [`Placeholder`](./features#placeholder)       | Empty-state hint.                    |
| [`History`](./features#history)               | Undo / redo.                         |
| [`Indent`](./features#indent)                 | Block indentation.                   |
| [`CharacterCount`](./features#charactercount) | Character / word counters.           |
| [`Dropcursor`](./features#dropcursor)         | Drop position indicator.             |
| [`Gapcursor`](./features#gapcursor)           | Cursor for empty nodes.              |
| [`Typography`](./features#typography)         | Smart punctuation.                   |
| [`Selection`](./features#selection)           | Keeps the selection visible on blur. |
| [`UniqueID`](./features#uniqueid)             | Stable per-block ids.                |
| [`Toc`](./features#toc)                       | Table of contents data.              |
| [`BubbleMenu`](./features#bubblemenu)         | Floating selection menu.             |
| [`CommandSlash`](./features#commandslash)     | `/` command menu.                    |
| [`CommandAKeymap`](./features#commandakeymap) | Smarter `Mod-A`.                     |
| [`DragHandle`](./features#draghandle)         | Block drag handle.                   |

## Writing your own

See [Custom extensions](./custom).
