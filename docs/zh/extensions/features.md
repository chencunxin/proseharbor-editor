# 功能扩展

功能扩展提供行为能力：插件、全局属性、键盘处理，或通过 `editor.storage` 暴露的数据。

## Placeholder

```ts
import { Placeholder } from '@proseharbor-editor/core'
```

| 选项                   | 类型      | 默认值                            | 说明                     |
| ---------------------- | --------- | --------------------------------- | ------------------------ |
| `placeholder`          | `string`  | `''`                              | 编辑器为空时显示的文本。 |
| `emptyEditorClass`     | `string`  | `'proseharbor-editor-empty'`      | 编辑器为空时的类名。     |
| `emptyNodeClass`       | `string`  | `'proseharbor-editor-node-empty'` | 空节点的类名。           |
| `showOnlyCurrent`      | `boolean` | `true`                            | 只在光标所在节点显示。   |
| `showOnlyWhenEditable` | `boolean` | `true`                            | 只读模式下不显示。       |

```ts
Placeholder.configure({ placeholder: '写点什么…' })
```

::: tip
Vue 组件**没有** `placeholder` 属性——始终通过扩展（或套件）配置：
`RichTextKit.configure({ placeholder: { placeholder: '…' } })`。
:::

## History

基于 `prosemirror-history` 的撤销 / 重做。

| 选项            | 类型     | 默认值         | 说明                             |
| --------------- | -------- | -------------- | -------------------------------- |
| `depth`         | `number` | `100`          | 保留的历史步数。                 |
| `newGroupDelay` | `number` | `500`          | 多少毫秒无操作后开启新的撤销组。 |
| `list`          | `array`  | `undo`、`redo` | 菜单分组。                       |

| 命令     | 说明   |
| -------- | ------ |
| `undo()` | 撤销。 |
| `redo()` | 重做。 |

快捷键：`Mod-Z`、`Mod-Shift-Z`、`Mod-Y`（另含西里尔键盘布局的适配）。

## Indent

对指定节点类型做块级缩进。

| 选项        | 类型       | 默认值                     | 说明               |
| ----------- | ---------- | -------------------------- | ------------------ |
| `types`     | `string[]` | `['paragraph', 'heading']` | 可缩进的节点类型。 |
| `minIndent` | `number`   | `0`                        | 最小级别。         |
| `maxIndent` | `number`   | `7`                        | 最大级别。         |
| `list`      | `array`    | `indent`、`outdent`        | 菜单分组。         |

| 命令        | 说明           |
| ----------- | -------------- |
| `indent()`  | 增加一级缩进。 |
| `outdent()` | 减少一级缩进。 |

缩进级别存放在 `indent` 属性中，渲染为 `data-indent`（`sanitizeHtml` 会把它转成
`padding-left: N*2em`）。列表内的 `Tab` 由 `ListItem` 处理。

## CharacterCount

`@tiptap/extensions` 的再导出，用于字数统计。

```ts
editor.storage.characterCount.characters()
editor.storage.characterCount.words()
```

在 Vue 组件中也可以使用辅助方法：

```ts
const { characters, words } = editor.getCharacters()
```

::: warning
未注册 `CharacterCount` 时，`getCharacters()` 会**返回**一个 `Error`（不会抛出）。
:::

## Dropcursor

`@tiptap/extensions` 的再导出，显示拖拽内容的落点。

```ts
Dropcursor.configure({
  width: 5,
  color: 'rgba(var(--proseharbor-editor-theme-primary-val), 0.3)',
  class: 'proseharbor-editor-dropcursor',
})
```

## Gapcursor

`@tiptap/extensions` 的再导出，为分割线与表格之间等不可达位置提供光标。

## Typography

`@tiptap/extension-typography` 的再导出：智能引号、破折号、省略号等。若需要
逐字节精确的输入，请禁用它。

```ts
BasicKit.configure({ typography: false })
```

## Selection

编辑器失焦时用装饰类保留选区高亮。

| 选项    | 类型     | 默认值                            |
| ------- | -------- | --------------------------------- |
| `class` | `string` | `'proseharbor-editor__selection'` |

```ts
Selection.configure({ class: 'my-selection' })
```

## UniqueID

为每个块生成稳定 ID，目录（TOC）正是靠它滚动定位到标题。

| 选项                | 类型                                  | 默认值          | 说明                             |
| ------------------- | ------------------------------------- | --------------- | -------------------------------- |
| `types`             | `string[]`                            | `['paragraph']` | 需要生成 ID 的节点类型。         |
| `attributeName`     | `string`                              | `'id'`          | 属性名（渲染为 `data-id`）。     |
| `generateID`        | `() => string`                        | `uuidv4()`      | ID 生成函数。                    |
| `filterTransaction` | `(tr, oldState, newState) => boolean` | `null`          | 用于跳过不想处理的 transaction。 |

```ts
UniqueID.configure({
  types: ['heading', 'paragraph'],
  generateID: () => `block-${Math.random().toString(36).slice(2)}`,
})
```

创建时会为已有节点补 ID，后续变更范围内缺失或重复的 ID 会被重新生成。

## Toc

把标题收集成树并持续更新。

| 选项          | 类型       | 默认值               | 说明                   |
| ------------- | ---------- | -------------------- | ---------------------- |
| `levels`      | `number[]` | `[1, 2, 3, 4, 5, 6]` | 收录的标题级别。       |
| `headingType` | `string`   | `'heading'`          | 被视为标题的节点类型。 |

```ts
interface TocItem {
  level: number
  text: string
  pos: number
  id: string | null
  children: TocItem[]
}
```

```ts
editor.storage.toc.tocItems // TocItem[]
editor.commands.updateToc() // 强制刷新
```

标题变化时会自动刷新，创建时也会刷新一次。建议与 `UniqueID` 搭配以获得 ID，并用
`<ProseharborEditorToc>` 渲染。

## BubbleMenu

`@tiptap/extension-bubble-menu` 的再导出（`BubbleMenu` 与 `BubbleMenuPlugin`）。

通常无需自行注册：`<ProseharborEditorBubble>` 会在挂载时调用
`editor.registerPlugin(BubbleMenuPlugin)`，卸载时调用
`editor.unregisterPlugin(pluginKey)`。

```ts
import { BubbleMenu, BubbleMenuPlugin } from '@proseharbor-editor/core'
```

## CommandSlash

基于 `@tiptap/suggestion` 的 `/` 命令菜单。

| 选项                 | 类型     | 默认值                                                           |
| -------------------- | -------- | ---------------------------------------------------------------- |
| `suggestion.char`    | `string` | `'/'`                                                            |
| `suggestion.command` | `fn`     | `({ editor, range, props }) => props.command({ editor, range })` |
| `suggestion.items`   | `fn`     | `() => []`（候选由 Vue 组件计算）                                |
| `suggestion.render`  | `fn`     | `() => ({})`                                                     |

`NotionKit` 已用 `createSlashSuggestion()` 装配好。

```ts
import { createSlashSuggestion, NotionKit } from '@proseharbor-editor/vue3'

NotionKit.configure({
  commandSlash: createSlashSuggestion({ char: '/', tippyOptions: { placement: 'bottom-start' } }),
})
```

候选来自所有 options 中含 `slash: true` 的扩展，其中 `Heading` 会按级别展开多项。

## CommandAKeymap

让 `Mod-A` 先选中当前节点内的文本，再按一次才全选文档。

命令：`selectTextWithinNodeBoundaries()`。

## DragHandle

在鼠标悬停的块左侧渲染手柄，用于拖拽块。

| 选项          | 类型     | 默认值                |
| ------------- | -------- | --------------------- |
| `handleId`    | `string` | `'editor-handle'`     |
| `handleBarId` | `string` | `'editor-handle-bar'` |

DOM 结构（`#editor-handle` > `#editor-handle-bar`）与样式标签在
`onBeforeCreate` 中创建并追加到 `document.body`，因此即使有多个编辑器也只存在一个手柄。

```ts
DragHandle.configure({ handleId: 'my-handle', handleBarId: 'my-handle-bar' })
```
