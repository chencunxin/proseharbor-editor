# About Us

## The project

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

## Tech stack

- [ProseMirror](https://prosemirror.net/) — the editing engine.
- [Tiptap v3](https://tiptap.dev/) — the extension layer.
- [Vue 3](https://vuejs.org/) — the view layer.
- [TypeScript](https://www.typescriptlang.org/) — everywhere.
- [Vite](https://vite.dev/) — build.
- [i18next](https://www.i18next.com/) — internationalization.
- [UnoCSS](https://unocss.dev/) and SCSS — styling.

## Contributing

```bash
git clone https://github.com/chencunxin/proseharbor-editor.git
cd proseharbor-editor
yarn install

yarn dev            # playground
yarn docs:dev       # documentation
yarn build          # build every workspace
yarn typecheck      # type check
yarn lint           # ESLint
```

Before opening a pull request please run `yarn lint` and `yarn typecheck`, and
keep the documentation in sync with the code.

## License

Released under the [MIT License](https://github.com/chencunxin/proseharbor-editor/blob/main/LICENSE).
