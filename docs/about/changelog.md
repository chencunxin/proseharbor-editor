# Changelog

All notable changes to this project are documented here. The project follows
[Semantic Versioning](https://semver.org/).

## 0.0.1

Initial public release of the monorepo.

### `@proseharbor-editor/core`

- `Editor` class extending `@tiptap/core`'s `Editor`, adding the
  `proseharbor-editor` class to the editable root.
- Node extensions: `Document` (with optional `title`), `Text`, `Paragraph`,
  `Heading`, `HardBreak`, `Blockquote`, `Divider`, `BulletList`, `OrderedList`,
  `ListItem`, `TaskList`, `CodeBlock`, `Image`, `Table`.
- Mark extensions: `Bold`, `Italic`, `Underline`, `Strike`, `Code`, `Subscript`,
  `Superscript`, `Link`, `Background`, plus the text style extensions
  `TextStyle`, `Color`, `FontFamily`, `FontSize`, `TextAlign`.
- Feature extensions: `Placeholder`, `History`, `Indent`, `CharacterCount`,
  `Dropcursor`, `Gapcursor`, `Typography`, `Selection`, `UniqueID`, `Toc`,
  `BubbleMenu`, `CommandSlash`, `CommandAKeymap`, `DragHandle`.
- i18n built on i18next with bundled `zh`, `en` and `de` locales
  (`addLocale`, `changeLocale`, `getLocale`, `t`, `te`).
- Utils: `sanitizeHtml`, `contentStyles`, `clamp`, `prefix` / `prefixClass`.
- ESM, CJS and UMD builds with type declarations.

### `@proseharbor-editor/vue3`

- `<ProseharborEditor>` component with `v-model`, HTML/JSON output, theme and
  locale props, full event forwarding and `expose({ editor, isFocused, isEmpty,
isCodeView, toggleCodeView })`.
- Reactive `Editor` subclass (state and extension storage kept in refs).
- Kits: `BasicKit`, `RichTextKit`, `NotionKit`.
- Menu components: `ProseharborEditorToolbar`, `ProseharborEditorBubble`,
  `ProseharborEditorSlash`, `ProseharborEditorToc`.
- UI components: `IButton`, `ITooltip`, `ITrigger`, `IDivider`, `IColorPicker`,
  `IIcon`.
- Vue node views: `VueNodeViewRenderer`, `NodeViewWrapper`, `NodeViewContent`.
- `style.css` (editor UI) and `content.css` (read-only rendering).

### Docs & playground

- VitePress documentation site with English and 简体中文 locales.
- Vue 3 playground demonstrating the basic, rich text and Notion style editors.
