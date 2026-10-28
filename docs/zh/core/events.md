# 事件

编辑器通过两种渠道派发事件：

1. 传给 `new Editor({ ... })` 的**回调配置项**（Tiptap 风格）。
2. 使用 `<ProseharborEditor>` 时的 **Vue 组件事件**。

二者底层是同一套回调——Vue 组件只是把它们再派发一次。

## 回调配置项

| 回调                | 触发时机                                              | 载荷                          |
| ------------------- | ----------------------------------------------------- | ----------------------------- |
| `onBeforeCreate`    | 编辑器视图创建之前。                                  | `{ editor }`                  |
| `onCreate`          | 编辑器初始化完成、可以使用。                          | `{ editor }`                  |
| `onUpdate`          | 文档内容发生变化。                                    | `{ editor }`                  |
| `onSelectionUpdate` | 选区发生变化。                                        | `{ editor }`                  |
| `onTransaction`     | 任意 transaction 被应用（触发非常频繁）。             | `{ editor, transaction }`     |
| `onFocus`           | 获得焦点。                                            | `{ editor, event }`           |
| `onBlur`            | 失去焦点。                                            | `{ editor, event }`           |
| `onDestroy`         | 实例销毁。                                            | —                             |
| `onContentError`    | 内容与 schema 不匹配（需开启 `enableContentCheck`）。 | `{ editor, error, … }`        |
| `onPaste`           | 粘贴内容。                                            | `{ editor, event, slice, … }` |
| `onDrop`            | 拖放内容。                                            | `{ editor, event, slice, … }` |

```ts
const editor = new Editor({
  element: document.querySelector('#editor') as HTMLElement,
  extensions: [RichTextKit],
  onCreate: ({ editor }) => console.log('ready', editor),
  onUpdate: ({ editor }) => console.log(editor.getHTML()),
  onFocus: ({ editor, event }) => console.log('focus', event),
})
```

::: tip
`onUpdate` 只收到 `{ editor }`，需要什么内容自行读取：
`editor.getHTML()`、`editor.getJSON()` 或 `editor.getText()`。
:::

## 命令式订阅

```ts
const onUpdate = () => console.log(editor.getHTML())

editor.on('update', onUpdate)
editor.off('update', onUpdate)
```

## Vue 组件事件

```vue
<template>
  <ProseharborEditor
    v-model="content"
    :extensions="extensions"
    @create="onCreate"
    @update="onUpdate"
    @focus="onFocus"
    @blur="onBlur"
    @selection-update="onSelectionUpdate"
    @transaction="onTransaction"
    @paste="onPaste"
    @drop="onDrop"
    @destroy="onDestroy"
    @content-error="onContentError"
    @before-create="onBeforeCreate"
  />
</template>
```

| 事件                | 载荷                      | 说明                                                    |
| ------------------- | ------------------------- | ------------------------------------------------------- |
| `update:modelValue` | `string \| object`        | `output="html"`（默认）时为 HTML 字符串，否则为 JSON。  |
| `update`            | `{ output, editor }`      | 与 `update:modelValue` 同时触发。                       |
| `beforeCreate`      | `{ editor }`              |                                                         |
| `create`            | `{ editor }`              | 派发前会先执行一次 update 逻辑，因此 `v-model` 已填充。 |
| `selectionUpdate`   | `{ editor }`              |                                                         |
| `transaction`       | `{ editor, transaction }` | 高频事件，避免在其中做重活。                            |
| `focus`             | `{ editor, event }`       |                                                         |
| `blur`              | `{ editor, event }`       |                                                         |
| `destroy`           | —                         |                                                         |
| `contentError`      | `{ editor, error }`       | 需开启 `enableContentCheck`。                           |
| `paste`             | `{ editor, event, … }`    | 由原始回调参数展开。                                    |
| `drop`              | `{ editor, event, … }`    | 由原始回调参数展开。                                    |

```ts
const onUpdate = ({ output, editor }: { output: string; editor: Editor }) => {
  console.log(output === editor.getHTML()) // output="html" 时为 true
}
```

## 双向绑定细节

- 外部修改 `v-model` 时会执行
  `editor.commands.setContent(value ?? '', { emitUpdate: false })`，因此**不会**
  再次触发 `update`。
- 内部编辑会先置位标记再派发事件，并在 `nextTick` 复位，避免父子组件之间的更新循环。

## 防抖保存

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const content = ref('')
const save = useDebounceFn((html: string) => api.save(html), 800)

watch(content, (html) => save(html))
</script>

<template>
  <ProseharborEditor v-model="content" :extensions="extensions" />
</template>
```
