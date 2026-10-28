# @proseharbor-editor/vue3

[`@proseharbor-editor/core`](../core) 的 Vue 3 适配层，提供组件与组合式 API。`vue` 为 peerDependency。

## 安装

```bash
yarn add @proseharbor-editor/vue3
```

## 组件

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProseHarborEditor, core } from '@proseharbor-editor/vue3'
import '@proseharbor-editor/core/style.css'

const html = ref('<p>Hello <strong>Vue</strong></p>')
const editorRef = ref<InstanceType<typeof ProseHarborEditor>>()

function toggleBold() {
  const view = editorRef.value?.getEditor()?.view
  if (view) core.run(view, core.toggleBold)
}
</script>

<template>
  <button @click="toggleBold">加粗</button>
  <ProseHarborEditor ref="editorRef" v-model="html" placeholder="开始输入…" />
</template>
```

## 组合式 API

```ts
import { useEditor, core } from '@proseharbor-editor/vue3'

const { editor, exec, getHTML } = useEditor({ target: el, content: '<p>Hello</p>' })
exec(core.toggleBold)
```

## Props

| 名称          | 类型       | 默认值  |
| ------------- | ---------- | ------- |
| `modelValue`  | `string`   | —       |
| `placeholder` | `string`   | —       |
| `editable`    | `boolean`  | `true`  |
| `autofocus`   | `boolean`  | `false` |
| `className`   | `string`   | —       |
| `plugins`     | `Plugin[]` | —       |

## Events

`update:modelValue(html)`、`change(payload)`、`ready(editor)`。

## License

MIT
