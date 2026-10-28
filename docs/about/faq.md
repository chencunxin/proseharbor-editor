# FAQ

## General

### Is `useEditor()` a real API?

No. `useEditor`, `createEditor()` and `run()` appear in some early READMEs but
are **not implemented**. Use:

- `new Editor(options)` from `@proseharbor-editor/core`, or
- `<ProseharborEditor>` and read the instance from the template ref
  (`editorRef.value.editor`).

### Is the component `ProseHarborEditor` or `ProseharborEditor`?

`ProseharborEditor` — lowercase `h`. The same applies to `ProseharborEditorToolbar`,
`ProseharborEditorBubble`, `ProseharborEditorSlash` and `ProseharborEditorToc`.

### Where do the kits live?

In `@proseharbor-editor/vue3`:

```ts
import { BasicKit, RichTextKit, NotionKit } from '@proseharbor-editor/vue3'
```

They are not exported from the core package.

### Can I use the core without Vue?

Yes — `@proseharbor-editor/core` has no framework dependency. You need to bring
your own menus.

## Usage

### Why is my placeholder not showing?

There is no `placeholder` prop. Configure the `Placeholder` extension:

```ts
RichTextKit.configure({ placeholder: { placeholder: 'Write something…' } })
```

### Why do my menu buttons do nothing / disappear?

Toolbar entries are resolved by extension name. If the extension is not part of
the schema the entry is dropped silently. Check
`editor.extensionManager.extensions` for a matching `name`.

### Why is nothing rendered after I pass `extensions`?

The Vue component filters the array and keeps only items whose `type` is
`extension`, `node` or `mark`. Plain objects are removed.

### How do I output JSON instead of HTML?

```vue
<ProseharborEditor v-model="json" output="json" :extensions="extensions" />
```

### Why does the editor keep resetting my `v-model`?

Only change `v-model` from the outside when you really mean to replace the
document — external changes call
`setContent(value, { emitUpdate: false })`. For reactive read-only use, listen to
`@update` instead of binding.

### `editor.isCodeView` is behaving strangely

On the **instance** it is a `Ref` (`editor.isCodeView.value`); on the component's
exposed object it is already unwrapped (`editorRef.value.isCodeView`).

### `getCharacters()` returns an Error

That means `CharacterCount` is not part of your schema. Add it (every kit
includes it) or read `editor.storage.characterCount` directly.

### Image upload fails for large files

Without `uploadImage`, images are inlined as base64 and files above **2 MB** are
rejected. Provide an uploader:

```ts
RichTextKit.configure({ image: { uploadImage: async (file) => url } })
```

### Why doesn't my custom bubble menu item render?

`BubbleSelector` calls `menu.isActive({ editor })` without a guard. Always
provide `isActive` for custom items in `ProseharborEditorBubble`.

## Styling

### The editor looks unstyled

Import the stylesheet:

```ts
import '@proseharbor-editor/vue3/style.css'
```

### How do I render saved HTML outside the editor?

```ts
import '@proseharbor-editor/vue3/content.css'
```

```html
<div class="proseharbor-editor-content" v-html="html"></div>
```

### How do I switch to dark mode?

```vue
<ProseharborEditor theme="dark" />
```

or imperatively with `changeTheme('dark')` / `toggleTheme()`. Only `'light'` and
`'dark'` are supported.

## Internationalization

### The UI is in English even though the default locale is `zh`

The core initialises i18next with `zh`, but the Vue component's `locale` prop
defaults to `'en'` and calls `changeLocale()` on mount. Set `locale="zh"`
explicitly.

### How do I add a language?

```ts
addLocale('fr', { bold: 'Gras' /* … */ })
changeLocale('fr')
```

## Contributing

### How do I run the docs and the playground?

```bash
yarn install
yarn dev        # playground
yarn docs:dev   # this documentation site
```
