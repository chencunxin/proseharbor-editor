# 组件

除编辑器本身外，`@proseharbor-editor/vue3` 还提供了菜单组件与一组基础 UI 组件。

```ts
import {
  ProseharborEditorToolbar,
  ProseharborEditorBubble,
  ProseharborEditorSlash,
  ProseharborEditorToc,
  NodeViewWrapper,
  NodeViewContent,
  IButton,
  ITooltip,
  ITrigger,
  IDivider,
  IColorPicker,
  IIcon,
} from '@proseharbor-editor/vue3'
```

所有菜单组件都需要传入 `editor` 实例。

## ProseharborEditorToolbar

```vue
<ProseharborEditorToolbar :editor="editor" :sort="toolbar" :code-view="isCodeView" />
```

### 属性

| 属性       | 类型      | 默认值              | 说明                                                       |
| ---------- | --------- | ------------------- | ---------------------------------------------------------- |
| `editor`   | `object`  | **必填**            | 编辑器实例。                                               |
| `sort`     | `array`   | `TOOLBAR_MENU_SORT` | 菜单顺序。元素可以是菜单名（`'bold'`）、`'                 | '`（分隔线）或菜单对象。 |
| `codeView` | `boolean` | `false`             | 是否处于 HTML 源码视图（会禁用大部分按钮）。也可传 `Ref`。 |

### 默认顺序

```ts
const TOOLBAR_MENU_SORT = [
  'history',
  '|',
  'textClear',
  '|',
  'fontFamily',
  'fontSize',
  '|',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'subscript',
  'superscript',
  '|',
  'color',
  'background',
  'textAlign',
  'table',
  'link',
  'image',
  'codeBlock',
  '|',
  'bulletList',
  'orderedList',
  'taskList',
  '|',
  'blockquote',
  'hardBreak',
  'indent',
  'outdent',
  '|',
  'divider',
  '|',
  'codeView',
]
```

### 菜单名如何解析

字符串元素会按名字在 `editor.extensionManager.extensions` 中查找同名扩展，并把
该扩展的 **options** 展开进菜单对象。因此按钮的外观与行为来自扩展配置：

```ts
RichTextKit.configure({
  color: { type: 'picker' }, // 颜色按钮使用完整取色面板
})
```

找不到对应扩展的项会被静默丢弃。

### 特殊项

| 项            | 行为                                             |
| ------------- | ------------------------------------------------ |
| `'            | '`                                               | 竖向 `IDivider`。 |
| `'textClear'` | `editor.chain().focus().unsetAllMarks().run()`。 |
| `'codeView'`  | 调用 `editor.toggleCodeView()`。                 |
| `'history'`   | 分组——按 `list` 渲染 `undo` / `redo`。           |
| `'indent'`    | 分组——渲染 `indent` / `outdent`。                |

### 禁用规则

- 源码视图下除 `history` 外全部禁用。
- 光标在代码块内时除 `history` 外全部禁用。
- 选中图片节点时，`textClear`、`table`、`hardBreak`、`divider`、`bulletList`、
  `orderedList`、`taskList`、`textAlign` 会被置灰。

### 插槽

- `prefix` / `suffix`——接收 `{ editor }`。
- 与菜单同名的具名插槽可覆盖该按钮——接收 `{ editor, ...menu }`。

```vue
<ProseharborEditorToolbar :editor="editor">
  <template #prefix="{ editor }">
    <span>{{ editor.storage.characterCount.words() }} 字</span>
  </template>

  <template #bold="{ editor, command, isActive }">
    <button :class="{ active: isActive({ editor }) }" @click="command({ editor })">B</button>
  </template>
</ProseharborEditorToolbar>
```

### 自定义菜单对象

```ts
const toolbar = [
  'bold',
  '|',
  {
    name: 'highlight',
    desc: '高亮',
    command: ({ editor }) =>
      editor.chain().focus().toggleBackground({ background: '#fef08a' }).run(),
    isActive: ({ editor }) => editor.isActive('background', { background: '#fef08a' }),
    isDisabled: ({ editor }) => !editor.can().toggleBackground(),
    shortcutkeys: 'Mod-Shift-H',
  },
]
```

::: warning
气泡菜单内部调用 `isActive` 时没有做空值保护，因此给
`ProseharborEditorBubble` 添加自定义项时务必提供 `isActive`。
:::

## ProseharborEditorBubble

选中文本时出现的浮动工具栏。

```vue
<ProseharborEditorBubble :editor="editor" />
```

### 属性

| 属性              | 类型                 | 默认值                      | 说明                          |
| ----------------- | -------------------- | --------------------------- | ----------------------------- |
| `editor`          | `object`             | **必填**                    | 编辑器实例。                  |
| `pluginKey`       | `string \| object`   | `'proseharborEditorBubble'` | 注册的 ProseMirror 插件 key。 |
| `sort`            | `array`              | `BUBBLE_MENU_SORT`          | 菜单顺序（格式同工具栏）。    |
| `updateDelay`     | `number`             | `60`                        | 重新计算位置的延迟（毫秒）。  |
| `appendTo`        | `function \| object` | `() => document.body`       | 浮动元素挂载位置。            |
| `floatingOptions` | `object`             | `{}`                        | `@floating-ui/dom` 选项。     |
| `shouldShow`      | `function \| null`   | `null`                      | 自定义显示判断。              |

### 默认顺序

```ts
const BUBBLE_MENU_SORT = [
  'fontFamily',
  'fontSize',
  '|',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'color',
  'background',
  'link',
  'textAlign',
  '|',
  'textClear',
]
```

### 显示条件

默认情况下，以下情况不显示：

- 选区为空，或位于空文本块内；
- 光标在代码块内；
- 选中了非图片的节点。

会根据上下文渲染不同面板：普通文本、链接、表格、图片。

```vue
<ProseharborEditorBubble
  :editor="editor"
  :should-show="({ editor }) => editor.isEditable && !editor.isActive('codeBlock')"
/>
```

生命周期：挂载时通过 `editor.registerPlugin(BubbleMenuPlugin)` 注册插件，卸载时
用 `editor.unregisterPlugin(pluginKey)` 移除，因此无需手动添加 `BubbleMenu` 扩展。

## ProseharborEditorSlash

`/` 命令菜单的渲染组件。通常不直接使用——`NotionKit` 已通过
`createSlashSuggestion()` 装配好。

### 属性

| 属性      | 类型       | 默认值   | 说明                           |
| --------- | ---------- | -------- | ------------------------------ |
| `editor`  | `object`   | **必填** | 编辑器实例。                   |
| `command` | `function` | **必填** | 选中某项时执行。               |
| `query`   | `string`   | `''`     | 当前搜索词（`/` 之后的内容）。 |

### 暴露

`{ onKeyDown }`——用于转发键盘事件。

### 让扩展出现在斜杠菜单中

```ts
import { Blockquote } from '@proseharbor-editor/core'

Blockquote.configure({ slash: true, desc: '> quote' })
```

候选来自所有 options 中含 `slash: true` 的扩展，其中 `heading` 会按级别展开多项。
过滤时同时匹配扩展名与翻译后的文案。

### 自定义 suggestion

```ts
import { createSlashSuggestion, NotionKit } from '@proseharbor-editor/vue3'

const extensions = [
  NotionKit.configure({
    commandSlash: createSlashSuggestion({
      char: '/',
      tippyOptions: { placement: 'bottom-start' },
    }),
  }),
]
```

## ProseharborEditorToc

由标题生成的目录。

```vue
<ProseharborEditorToc :editor="editor" :scroll-view="scrollViewEl" />
```

### 属性

| 属性         | 类型          | 默认值   | 说明                                               |
| ------------ | ------------- | -------- | -------------------------------------------------- |
| `editor`     | `object`      | **必填** | 编辑器实例。                                       |
| `scrollView` | `HTMLElement` | `null`   | 用于计算当前激活标题的滚动容器，默认取编辑器 DOM。 |

数据来自 `editor.storage.toc.tocItems`（需要 `Toc` 扩展，`RichTextKit` 与
`NotionKit` 均已包含）。点击条目会平滑滚动到对应标题；滚动时会自动高亮最靠上的
可见标题。

```ts
editor.commands.updateToc() // 强制刷新
```

## Node view

用 Vue 渲染节点：

```vue
<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@proseharbor-editor/vue3'

defineProps<{ node: any; updateAttributes: (attrs: any) => void }>()
</script>

<template>
  <NodeViewWrapper class="my-card">
    <span>自定义卡片</span>
    <NodeViewContent as="div" />
  </NodeViewWrapper>
</template>
```

```ts
import { VueNodeViewRenderer } from '@proseharbor-editor/vue3'
import CardView from './CardView.vue'

const Card = Node.create({
  name: 'card',
  group: 'block',
  content: 'inline*',
  addNodeView() {
    return VueNodeViewRenderer(CardView)
  },
})
```

::: warning
`NodeViewWrapper` **必须**作为 node view 的根元素，否则 `VueNodeView` 会抛出
`Please use the NodeViewWrapper component for your node view.`。
:::

| 组件              | 属性            | 插槽 |
| ----------------- | --------------- | ---- |
| `NodeViewWrapper` | `as`（`'div'`） | 默认 |
| `NodeViewContent` | `as`（`'div'`） | —    |

## UI 组件

| 组件           | 属性                                                                                    | 事件            | 插槽                 | 暴露                                            |
| -------------- | --------------------------------------------------------------------------------------- | --------------- | -------------------- | ----------------------------------------------- |
| `IButton`      | `disabled`、`active`、`semiActive`、`danger`、`success`、`long`（均为 `boolean`）       | —               | `icon`、`default`    | —                                               |
| `ITooltip`     | `text`、`shortcutkeys`、`tippyOptions`（`{}`）、`disabled`                              | —               | `default`            | `hide`、`show`、`enable`、`disable`、`setProps` |
| `ITrigger`     | `tippyOptions`（`{}`）、`disabled`                                                      | —               | `default`、`content` | `hide`、`show`、`enable`、`disable`、`setProps` |
| `IDivider`     | `type`（`'horizontal'` / `'vertical'`）、`dashed`                                       | —               | —                    | —                                               |
| `IColorPicker` | `defaultColorName`、`baseColorName`、`standardColorName`、`recentUseName`、`storageKey` | `change(color)` | —                    | —                                               |
| `IIcon`        | `name`（必填）、`size`（`'1em'`）、`color`（`'currentColor'`）                          | —               | —                    | —                                               |

```vue
<ITooltip text="加粗" shortcutkeys="Mod-B">
  <IButton :active="isBold" @click="toggle">
    <IIcon name="bold" />
  </IButton>
</ITooltip>
```

说明：

- `IButton` 固定渲染 `type="button"`，并在 `mousedown` 时 `preventDefault()`，因此点击不会抢走选区或提交表单。
- `IIcon` 会解析为内置 Iconify 图标集中的 `proseharbor-editor:{kebab-case-name}`。
- `IColorPicker` 把最近使用的颜色写入 `localStorage`（最多 9 个，SSR 安全）。

## 工具函数

再导出的辅助函数：

| 导出                                                                                                                                                                             | 说明                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `isMacOS`、`isArray`、`isObject`、`isString`、`isEmpty`                                                                                                                          | 类型判断。                               |
| `convertShortcutKeys(str)`                                                                                                                                                       | `'Mod-Shift-B'` → `'⌘⇧B'` / `'Ctrl⇧B'`。 |
| `createTippy(element, options)`                                                                                                                                                  | 以默认配置创建 tippy 实例。              |
| `getDefaultColors`、`getPickerStandardColors`、`getPickerColors`、`getPickerColorsFlat`、`getPickerColorsByShade`、`getPickerShadesByColor`、`getRecentColors`、`addRecentColor` | 调色板相关。                             |
| `toggleTheme`、`changeTheme`                                                                                                                                                     | 主题切换。                               |
| `convertToKebabCase`、`formatHTML`                                                                                                                                               | 字符串 / HTML 格式化。                   |
| `sanitizeUrl`、`isSafeUrl`                                                                                                                                                       | URL 安全校验（链接菜单使用）。           |
| `VueRenderer`、`VueNodeViewRenderer`                                                                                                                                             | 在 ProseMirror 中渲染 Vue 组件。         |

```ts
import { convertShortcutKeys, toggleTheme, sanitizeUrl } from '@proseharbor-editor/vue3'

convertShortcutKeys('Mod-Shift-B') // macOS 为 '⌘⇧B'
toggleTheme() // 亮色 <-> 暗色
sanitizeUrl('javascript:alert(1)') // 被拦截
```
