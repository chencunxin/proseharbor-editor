# Introduction

## What is Proseharbor Editor?

`proseharbor-editor` is an open source web editor built on top of
[ProseMirror](https://prosemirror.net/) and [Tiptap](https://tiptap.dev/). It is
efficient, themeable and ready to use out of the box, while staying fully
extensible.

It can be used as a classic rich text editor (output **HTML**), or as a block
/ Notion-style editor (output **JSON**), depending on how you configure it.

## Packages

| Package                    | Path            | Description                                                                                     |
| -------------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| `@proseharbor-editor/core` | `packages/core` | Framework agnostic kernel: `Editor` class, 40+ extensions, i18n, utils.                         |
| `@proseharbor-editor/vue3` | `packages/vue3` | Vue 3 layer: `ProseharborEditor` component, kits, toolbar / bubble / slash / TOC menus, styles. |

Both packages ship ESM, CJS, UMD and type declarations.

## Features

- **Rich text out of the box** — bold, italic, underline, strike, code,
  sub/superscript, link, color, background, font family, font size, alignment.
- **Block & Notion style** — slash command menu (`/`), drag handle, TOC,
  indentation, unique block ids.
- **Markdown input rules** — `# ` for headings, `> ` for blockquote, `--- ` for
  a divider, `==text==` for highlight, ` ``` ` for code blocks …
- **Framework friendly** — the core has no UI framework dependency; the Vue 3
  package adds a component and a set of ready made menus.
- **i18n** — `zh`, `en` and `de` locales are bundled; adding a locale is one
  function call.
- **Theming** — light / dark theme plus a full set of CSS custom properties
  (`--proseharbor-editor-*`).
- **HTML or JSON output** — switch with a single `output` prop.
- **Type safe** — written in TypeScript, declared commands and options.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ @proseharbor-editor/vue3                                     │
│   ProseharborEditor  ProseharborEditorToolbar                │
│   ProseharborEditorBubble  ProseharborEditorSlash            │
│   ProseharborEditorToc   BasicKit / RichTextKit / NotionKit  │
└───────────────────────────┬─────────────────────────────────┘
                            │ depends on
┌───────────────────────────▼─────────────────────────────────┐
│ @proseharbor-editor/core                                    │
│   Editor (extends @tiptap/core Editor)                      │
│   Nodes / Marks / Extensions   Locales (i18next)   Utils    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│ Tiptap v3 / ProseMirror                                     │
└─────────────────────────────────────────────────────────────┘
```

`@proseharbor-editor/core` re-exports everything from `@tiptap/core`, so every
Tiptap API (`EditorOptions`, `commands`, `chain()`, `Node`, `Mark`,
`Extension`, …) is available from a single import.

## Relationship with Tiptap

- The `Editor` class exported by the core **extends** Tiptap's `Editor`; the
  only override adds the `proseharbor-editor` CSS class to the editor root.
- Every bundled extension is either a thin wrapper around the official Tiptap
  extension or a custom one written with the same `Node.create` / `Mark.create`
  / `Extension.create` API.
- Commands are plain Tiptap commands: `editor.chain().focus().toggleBold().run()`.

On top of that, each extension carries **menu metadata** in its options
(`command`, `isActive`, `isDisabled`, `shortcutkeys`, `icon`, `desc`,
`slash`, …). That metadata is what the Vue menus read to render buttons — this
is the main added value compared to using Tiptap directly.

## What's next?

- [Quick Start](./quick-start) — install and render your first editor.
- [Core / Instance](../core/instance) — every option of the `Editor` class.
- [Vue 3 / Quick Start](../vue3/quick-start) — the Vue component and menus.
- [Kits](../kit/basic) — pre-composed extension bundles.
- [Extensions](../extensions/overview) — the full extension reference.
