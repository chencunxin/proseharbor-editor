# proseharbor-editor

[![NPM](https://img.shields.io/npm/v/%40proseharbor-editor%2Fcore.svg)](https://www.npmjs.com/package/@proseharbor-editor/core)

[![GitHub](https://img.shields.io/github/stars/chencunxin/proseharbor-editor.svg?style=social)](https://github.com/chencunxin/proseharbor-editor)

[简体中文](./README-zh.md)

## Introduction

**Proseharbor Editor** is an open source web editor built on
[ProseMirror](https://prosemirror.net/) and [Tiptap](https://tiptap.dev/). Our
goal is to make it easy for developers to add text editing to their applications
— either as a classic rich text editor (HTML output) or as a block / Notion-style
editor (JSON output).

Compared with other open source editors, Proseharbor Editor is young and focuses
on two things:

1. **Being usable immediately** — kits, menus, themes and locales are included,
   so a working editor is three lines of code.
2. **Being fully extensible** — use the bundled kits, pick individual core
   extensions, or write your own with the standard Tiptap API.

## Repository layout

| Directory       | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `packages/core` | `@proseharbor-editor/core` — headless kernel.              |
| `packages/vue3` | `@proseharbor-editor/vue3` — Vue 3 component, kits, menus. |
| `docs`          | This documentation site (VitePress).                       |
| `playground`    | Local Vue 3 demo of every preset.                          |

The repository is a [Yarn 4 Workspaces](https://yarnpkg.com/) monorepo built
with Vite.

## Quick Start

```bash
yarn install
yarn dev            # Startup playground（http://localhost:5173）
yarn docs:dev       # Startup Document
yarn build          # Build workspace
yarn build:packages # Only build the packages to be released
yarn typecheck      # Type checking
yarn lint           # ESLint（TS + Vue）
```

## Features

- **Ready to Use**: Simple to integrate with just a few lines of code, no complex configuration needed.
- **Extensible**: Rich set of plug-and-play extensions and view components, with support for customization.
- **Customizable**: Supports custom theme styling, comes with built-in light and dark themes.
- **Multilingual**: Supports multilingual editing, with built-in English and Chinese support, extensible for more languages.
- **Flexible**: Supports various editing modes including block editing, rich text, WYSIWYG, Markdown, and Notion Style editing.
- **High Performance**: Built on ProseMirror and TipTap for smooth editing experience.

## License

[MIT](./LICENSE)
