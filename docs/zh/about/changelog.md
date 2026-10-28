# 变更日志

本项目所有重要变更都记录在此，并遵循
[语义化版本](https://semver.org/lang/zh-CN/)。

## 0.0.1

monorepo 的首次公开发布。

### `@proseharbor-editor/core`

- `Editor` 类继承 `@tiptap/core` 的 `Editor`，为可编辑区根节点添加
  `proseharbor-editor` 类名。
- 节点扩展：`Document`（可选的 `title`）、`Text`、`Paragraph`、`Heading`、
  `HardBreak`、`Blockquote`、`Divider`、`BulletList`、`OrderedList`、`ListItem`、
  `TaskList`、`CodeBlock`、`Image`、`Table`。
- 标记扩展：`Bold`、`Italic`、`Underline`、`Strike`、`Code`、`Subscript`、
  `Superscript`、`Link`、`Background`，以及文字样式扩展 `TextStyle`、`Color`、
  `FontFamily`、`FontSize`、`TextAlign`。
- 功能扩展：`Placeholder`、`History`、`Indent`、`CharacterCount`、`Dropcursor`、
  `Gapcursor`、`Typography`、`Selection`、`UniqueID`、`Toc`、`BubbleMenu`、
  `CommandSlash`、`CommandAKeymap`、`DragHandle`。
- 基于 i18next 的国际化，内置 `zh`、`en`、`de` 三个语言包
  （`addLocale`、`changeLocale`、`getLocale`、`t`、`te`）。
- 工具函数：`sanitizeHtml`、`contentStyles`、`clamp`、`prefix` / `prefixClass`。
- ESM、CJS、UMD 产物与类型声明。

### `@proseharbor-editor/vue3`

- `<ProseharborEditor>` 组件：支持 `v-model`、HTML/JSON 输出、主题与语言属性、
  完整的事件转发，并 `expose({ editor, isFocused, isEmpty, isCodeView, toggleCodeView })`。
- 响应式 `Editor` 子类（状态与扩展存储存放在 ref 中）。
- 套件：`BasicKit`、`RichTextKit`、`NotionKit`。
- 菜单组件：`ProseharborEditorToolbar`、`ProseharborEditorBubble`、
  `ProseharborEditorSlash`、`ProseharborEditorToc`。
- UI 组件：`IButton`、`ITooltip`、`ITrigger`、`IDivider`、`IColorPicker`、`IIcon`。
- Vue node view：`VueNodeViewRenderer`、`NodeViewWrapper`、`NodeViewContent`。
- `style.css`（编辑器 UI）与 `content.css`（只读展示）。

### 文档与演示

- 基于 VitePress 的文档站，提供 English 与简体中文两种语言。
- 演示基础、富文本与 Notion 三种编辑器的 Vue 3 playground。
