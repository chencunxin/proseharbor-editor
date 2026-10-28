# ProseharborEditor

主组件。注意拼写：**`ProseharborEditor`**（`h` 小写）。

```ts
import { ProseharborEditor } from '@proseharbor-editor/vue3'
```

## 属性

| 属性                 | 类型                          | 默认值    | 说明                                                                                  |
| -------------------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------- |
| `modelValue`         | `object \| array \| string`   | `''`      | 编辑器内容，支持 `v-model`。字符串按 HTML 解析，对象 / 数组按 ProseMirror JSON 解析。 |
| `extensions`         | `array`                       | `[]`      | 扩展列表，只保留 `type` 为 `extension`、`node`、`mark` 的项。                         |
| `locale`             | `string`                      | `'en'`    | 语言标识，响应式，会调用 `changeLocale()`。                                           |
| `theme`              | `string`                      | `'light'` | `'light'` 或 `'dark'`，会写入 `<body>` 的 `proseharbor-theme` 属性。                  |
| `output`             | `string`                      | `'html'`  | `'html'` → `getHTML()`，其它值 → `getJSON()` 作为 `update:modelValue` 载荷。          |
| `autofocus`          | `boolean \| string \| number` | `false`   | 创建后聚焦；`editable` 为 `false` 时强制为 `false`。                                  |
| `editable`           | `boolean`                     | `true`    | 是否可编辑。                                                                          |
| `enableInputRules`   | `boolean \| array`            | `true`    | Markdown 输入规则；传数组可限定生效的扩展。                                           |
| `enablePasteRules`   | `boolean \| array`            | `true`    | 粘贴规则。                                                                            |
| `enableContentCheck` | `boolean`                     | `false`   | 校验内容是否匹配 schema（触发 `contentError`）。                                      |
| `injectCSS`          | `boolean`                     | `true`    | 注入 Tiptap 基础 CSS。                                                                |
| `injectNonce`        | `string`                      | —         | 注入 `<style>` 的 nonce（CSP）。                                                      |
| `editorProps`        | `object`                      | `{}`      | 透传给 ProseMirror 的 `EditorProps`。                                                 |
| `parseOptions`       | `object`                      | `{}`      | 传给 `DOMParser` 的选项。                                                             |
| `spellcheck`         | `boolean`                     | `false`   | 写入 `editorProps.attributes.spellcheck`。                                            |

::: tip
组件**没有** `placeholder` 属性。占位文本通过 `Placeholder` 扩展（或套件）配置：

```ts
RichTextKit.configure({ placeholder: { placeholder: '写点什么…' } })
```

:::

## 事件

| 事件                | 载荷                      | 说明                                    |
| ------------------- | ------------------------- | --------------------------------------- |
| `update:modelValue` | `string \| object`        | 内容变化（形态取决于 `output`）。       |
| `update`            | `{ output, editor }`      | 与上面同时触发，并带上实例。            |
| `beforeCreate`      | `{ editor }`              | 视图创建之前。                          |
| `create`            | `{ editor }`              | 编辑器就绪（此时 `v-model` 已初始化）。 |
| `selectionUpdate`   | `{ editor }`              | 选区变化。                              |
| `transaction`       | `{ editor, transaction }` | 任意 transaction。                      |
| `focus`             | `{ editor, event }`       | 获得焦点。                              |
| `blur`              | `{ editor, event }`       | 失去焦点。                              |
| `destroy`           | —                         | 实例销毁。                              |
| `contentError`      | `{ editor, error }`       | 内容与 schema 不匹配。                  |
| `paste`             | `{ editor, event, … }`    | 粘贴。                                  |
| `drop`              | `{ editor, event, … }`    | 拖放。                                  |

详见[事件](../core/events)。

## 暴露的成员

```ts
expose({
  editor, // Editor 实例（响应式子类）
  isFocused, // boolean
  isEmpty, // boolean
  isCodeView, // boolean
  toggleCodeView, // () => void
})
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProseharborEditor, RichTextKit } from '@proseharbor-editor/vue3'

const editorRef = ref()
const extensions = [RichTextKit]

const focus = () => editorRef.value?.editor?.commands.focus('end')
const toggleSource = () => editorRef.value?.toggleCodeView()
</script>

<template>
  <button @click="focus">聚焦</button>
  <button @click="toggleSource">源码</button>
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
</template>
```

::: warning
`editorRef.value.isCodeView` 是普通 `boolean`，而
`editorRef.value.editor.isCodeView` 是 `Ref`——后者记得取 `.value`。
:::

## 插槽

仅支持**默认插槽**，它渲染在可编辑区**之外**，且在 HTML 源码视图下会隐藏。
可用于放置菜单或自定义底部内容：

```vue
<ProseharborEditor v-model="content" :extensions="extensions">
  <ProseharborEditorToolbar :editor="editorRef?.editor" />
</ProseharborEditor>
```

渲染出的 DOM 结构：

```html
<div class="proseharbor-editor-editor-root">
  <div class="proseharbor-editor-prosemirror-wrapper"><!-- ProseMirror --></div>
  <!-- 默认插槽 -->
  <div class="proseharbor-editor-code-editor-wrapper"><!-- 仅源码视图 --></div>
</div>
```

## 响应式状态

`@proseharbor-editor/vue3` 导出的 `Editor` 类把 `state` 与 `storage` 存在 ref
中，并在 `beforeTransaction` 里刷新，所以菜单会自动更新。你自己的组件也可以
依赖同一机制：

```ts
import { computed } from 'vue'

const isBold = computed(() => editorRef.value?.editor?.isActive('bold'))
```

## 销毁

组件在卸载时会自动销毁编辑器；当配置变化需要重建时也会先 `destroy()`。通常
无需自己调用 `editor.destroy()`。
