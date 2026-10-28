# 实例

`Editor` 类是编辑器的核心。`@proseharbor-editor/core` 导出的是 Tiptap `Editor`
的子类，它给可编辑区根节点加上 `proseharbor-editor` 类名：

```ts
// packages/core/src/editor.ts
export class Editor extends TipTap.Editor {
  constructor(options: Partial<EditorOptions> = {}) {
    super(options)
    return this
  }

  override prependClass(): void {
    this.view.dom.className = `${prefixClass} ${this.view.dom.className}`
  }
}
```

::: tip 没有工厂函数
项目里**没有** `createEditor()` 辅助函数——直接用 `new Editor(options)` 实例化。
:::

## 创建实例

```ts
import { Editor, Document, Text, Paragraph, Bold } from '@proseharbor-editor/core'

const editor = new Editor({
  element: document.querySelector('#editor') as HTMLElement,
  content: '<p>Hello</p>',
  extensions: [Document, Text, Paragraph, Bold],
})
```

在 Vue 应用中通常由 `<ProseharborEditor>` 创建实例，再从模板 ref 取出——见
[Vue 3 / 编辑器组件](../vue3/editor)。

## 配置项

全部配置来自 Tiptap 的 `EditorOptions`（内核已再导出）。

### 内容与 schema

| 配置项       | 类型                                             | 默认值  | 说明                                       |
| ------------ | ------------------------------------------------ | ------- | ------------------------------------------ |
| `element`    | `HTMLElement`                                    | —       | 挂载点。内核必填；Vue 组件会自动传入。     |
| `content`    | `string \| object \| array`                      | `''`    | 初始内容——HTML 字符串或 ProseMirror JSON。 |
| `extensions` | `AnyExtension[]`                                 | `[]`    | 构成 schema 的节点、标记与扩展。           |
| `editable`   | `boolean`                                        | `true`  | 是否可编辑。                               |
| `autofocus`  | `boolean \| 'start' \| 'end' \| 'all' \| number` | `false` | 创建后的聚焦行为。                         |

::: warning
Vue 组件的 `extensions` 属性会过滤，只保留 `type` 为 `extension`、`node` 或
`mark` 的项，其余会被静默丢弃。
:::

### 行为

| 配置项               | 类型                  | 默认值  | 说明                                                             |
| -------------------- | --------------------- | ------- | ---------------------------------------------------------------- |
| `editorProps`        | `object`              | `{}`    | 透传给 ProseMirror 的 `EditorProps`（attributes、handlers 等）。 |
| `parseOptions`       | `object`              | `{}`    | 传给 `DOMParser` 的选项。                                        |
| `enableInputRules`   | `boolean \| string[]` | `true`  | 是否启用 Markdown 输入规则，可传入扩展名数组做限定。             |
| `enablePasteRules`   | `boolean \| string[]` | `true`  | 同上，针对粘贴规则。                                             |
| `enableContentCheck` | `boolean`             | `false` | 校验内容是否匹配 schema，通过 `onContentError` 报告。            |
| `injectCSS`          | `boolean`             | `true`  | 注入 Tiptap 的最小 CSS（如 gap cursor）。                        |
| `injectNonce`        | `string`              | —       | 注入 `<style>` 时使用的 nonce（CSP）。                           |
| `spellcheck`         | `boolean`             | `false` | Vue 组件特有属性，会写入 `editorProps.attributes.spellcheck`。   |

### 事件回调

完整列表见[事件](./events)（`onUpdate`、`onCreate`、`onFocus` 等）。

## 实例属性

| 属性               | 类型                  | 说明                                     |
| ------------------ | --------------------- | ---------------------------------------- |
| `view`             | `EditorView`          | 底层 ProseMirror 视图。                  |
| `state`            | `EditorState`         | 当前编辑器状态。                         |
| `schema`           | `Schema`              | 由扩展构建出的 schema。                  |
| `commands`         | `SingleCommands`      | 所有命令，可直接调用。                   |
| `storage`          | `Record<string, any>` | 扩展存储（`characterCount`、`toc` 等）。 |
| `extensionManager` | `ExtensionManager`    | 已注册扩展及其配置。                     |
| `extensionStorage` | `Record<string, any>` | 扩展存储的别名。                         |
| `isEditable`       | `boolean`             | 是否可编辑。                             |
| `isEmpty`          | `boolean`             | 文档是否为空。                           |
| `isFocused`        | `boolean`             | 是否聚焦。                               |
| `isDestroyed`      | `boolean`             | 是否已销毁。                             |

## 实例方法

### 内容

| 方法                                      | 说明                        |
| ----------------------------------------- | --------------------------- |
| `getHTML()`                               | 序列化为 HTML 字符串。      |
| `getJSON()`                               | 序列化为 ProseMirror JSON。 |
| `getText(options?)`                       | 纯文本，可带块分隔符。      |
| `setContent(content, options?)`           | 替换整个文档。              |
| `insertContent(value, options?)`          | 在当前选区插入。            |
| `insertContentAt(range, value, options?)` | 在指定范围插入。            |
| `clearContent(emitUpdate?)`               | 清空文档。                  |

```ts
editor.commands.setContent('<p>替换后的内容</p>', { emitUpdate: false })
```

### 选区与状态

| 方法                                    | 说明                                   |
| --------------------------------------- | -------------------------------------- |
| `isActive(name, attrs?)`                | 判断节点 / 标记在当前选区是否激活。    |
| `getAttributes(name)`                   | 获取激活节点 / 标记的属性。            |
| `can()`                                 | 链式判断命令是否可以执行。             |
| `chain()` / `startChain()`              | 构建命令链，最后 `.run()`。            |
| `focus(position?, options?)` / `blur()` | 管理 DOM 焦点。                        |
| `setEditable(editable, emitUpdate?)`    | 切换可编辑状态。                       |
| `getCharacterCount()`                   | 读取 `characterCount` 存储的快捷方式。 |

### 插件与生命周期

| 方法                                     | 说明                    |
| ---------------------------------------- | ----------------------- |
| `registerPlugin(plugin, handlePlugins?)` | 添加 ProseMirror 插件。 |
| `unregisterPlugin(nameOrPluginKey)`      | 移除已注册的插件。      |
| `on(event, cb)` / `off(event, cb)`       | 订阅 / 取消订阅事件。   |
| `destroy()`                              | 卸载并清理。            |
| `prependClass()`                         | 重新应用根类名。        |

## Vue 3 子类

`@proseharbor-editor/vue3` 导出的 `Editor` 继承内核版本，并加入响应式状态，
使菜单能随 transaction 自动刷新：

```ts
export class Editor extends CoreEditor {
  contentComponent: AnyRecord | null
  appContext: AnyRecord | null
  reactiveState: Ref<EditorState>
  reactiveExtensionStorage: Ref<Record<string, any>>
}
```

- `state` 与 `storage` 被覆写为返回 `Ref`，在 `beforeTransaction` 中更新，并用双层 `requestAnimationFrame` 节流。
- 实例被 `markRaw()` 包裹，可安全放进 `ref`。

组件还会向实例上挂载几个辅助成员：

| 成员                     | 类型                                                   | 说明                                             |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------ |
| `uuid`                   | `string`                                               | 实例 ID。                                        |
| `getCharacters(params?)` | `() => { characters: number; words: number } \| Error` | 字数统计。缺少 `CharacterCount` 时返回 `Error`。 |
| `isCodeView`             | `Ref<boolean>`                                         | 是否处于 HTML 源码视图（**实例上是 ref**）。     |
| `toggleCodeView()`       | `() => void`                                           | 在富文本与 HTML 源码之间切换。                   |
| `contentComponent`       | `object \| null`                                       | 创建该编辑器的 Vue 组件实例。                    |
| `appContext`             | `object \| null`                                       | Vue 应用上下文，渲染 node view 时使用。          |

::: warning
`editor.isCodeView` 在实例上是 **ref**，而组件暴露出来的值已解包——
`editorRef.value.isCodeView` 是普通 `boolean`。
:::

## 在 Vue 中获取实例

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ProseharborEditor, RichTextKit } from '@proseharbor-editor/vue3'

const editorRef = ref()
const extensions = [RichTextKit]

onMounted(() => {
  const editor = editorRef.value.editor
  editor.chain().focus().toggleBold().run()
})
</script>

<template>
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
</template>
```

组件暴露的内容：

```ts
expose({
  editor, // Editor 实例
  isFocused, // boolean
  isEmpty, // boolean
  isCodeView, // boolean
  toggleCodeView,
})
```
