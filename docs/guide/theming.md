# Theming

## Stylesheets

`@proseharbor-editor/vue3` publishes two stylesheets:

| Import                                 | Required | Purpose                                                                      |
| -------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `@proseharbor-editor/vue3/style.css`   | ✅       | Full editor UI: content, toolbar, bubble menu, slash menu, TOC, Prism theme. |
| `@proseharbor-editor/vue3/content.css` | optional | Read-only rendering **outside** of the editor.                               |

```ts
import '@proseharbor-editor/vue3/style.css'
```

::: warning
Even though the component imports its own SCSS (so bundlers may inject it
automatically), always import `style.css` explicitly — the package declares
`sideEffects: ["**/*.css", "**/preload-icons.ts"]`, and tree-shaking
configurations may otherwise drop it.
:::

### Rendering saved HTML elsewhere

Add the `proseharbor-editor-content` class to your display container and import
`content.css`:

```vue
<script setup lang="ts">
import '@proseharbor-editor/vue3/content.css'
defineProps<{ html: string }>()
</script>

<template>
  <div class="proseharbor-editor-content" v-html="html" />
</template>
```

## Light / dark theme

```vue
<template>
  <ProseharborEditor v-model="content" theme="dark" :extensions="extensions" />
</template>
```

`theme` accepts `'light'` (default) or `'dark'`. Any other value is ignored with
a console warning. Under the hood the component calls `changeTheme()`, which
writes a `proseharbor-theme` attribute on `<body>`:

```html
<body proseharbor-theme="dark"></body>
```

You can drive it yourself too:

```ts
import { changeTheme, toggleTheme } from '@proseharbor-editor/vue3'

changeTheme('dark')
toggleTheme()
```

::: tip
`changeTheme()` is a no-op during SSR (no `document`), so it is safe to call in
a `setup()` that also runs on the server.
:::

## CSS custom properties

Every visual token is a CSS variable shaped as

```
--proseharbor-editor-{type}-{name}
```

and can be overridden globally:

```css
:root {
  --proseharbor-editor-theme-primary: #3b82f6;
  --proseharbor-editor-theme-primary-val: 59, 130, 246; /* rgb triplet */
  --proseharbor-editor-bg-color: #ffffff;
  --proseharbor-editor-border-color: #e5e7eb;
  --proseharbor-editor-color-blue: #2563eb;
  --proseharbor-editor-font-size: 14px;
}
```

Dark values live under the `[proseharbor-theme='dark']` selector, so overriding
a variable for both themes means writing it twice:

```css
:root {
  --proseharbor-editor-bg-color: #fff;
}
[proseharbor-theme='dark'] {
  --proseharbor-editor-bg-color: #1f2328;
}
```

## Class prefix

All class names are prefixed with `proseharbor-editor`:

| Element                     | Class                                     |
| --------------------------- | ----------------------------------------- |
| Editor root                 | `.proseharbor-editor-editor-root`         |
| ProseMirror wrapper         | `.proseharbor-editor-prosemirror-wrapper` |
| Editable content            | `.proseharbor-editor.ProseMirror`         |
| Toolbar                     | `.proseharbor-editor-toolbar-menu`        |
| Bubble menu                 | `.proseharbor-editor-bubble-menu`         |
| Slash menu                  | `.proseharbor-editor-slash-menu`          |
| TOC                         | `.proseharbor-editor-toc`                 |
| Read-only content container | `.proseharbor-editor-content`             |

Node level classes are derived from the same prefix, e.g.
`.proseharbor-editor__paragraph`, `.proseharbor-editor__heading`,
`.proseharbor-editor__code`, `.proseharbor-editor__table`,
`.proseharbor-editor__image`.

```css
.proseharbor-editor__paragraph {
  margin: 0.5em 0;
}
```

## Icons

Menu icons are rendered through `@iconify/vue` from the private
`proseharbor-editor` icon set. Menu names are converted to kebab-case, so the
`addColumnAfter` menu uses the `proseharbor-editor:add-column-after` icon.

```vue
<script setup lang="ts">
import { IIcon } from '@proseharbor-editor/vue3'
</script>

<template>
  <IIcon name="bold" size="1.2em" />
  <!-- -> proseharbor-editor:bold -->
</template>
```
