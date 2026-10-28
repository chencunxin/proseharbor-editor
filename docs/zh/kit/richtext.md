# 富文本套件

`RichTextKit` 是传统 WYSIWYG 编辑器的推荐预设：[基础套件](./basic)的全部内容，
再加上标题、列表、表格、图片、代码块与完整文字样式能力。

```ts
import { RichTextKit } from '@proseharbor-editor/vue3'
```

## 用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ProseharborEditor,
  ProseharborEditorToolbar,
  ProseharborEditorBubble,
  RichTextKit,
} from '@proseharbor-editor/vue3'
import '@proseharbor-editor/vue3/style.css'

const content = ref('')
const editorRef = ref()
const extensions = [
  RichTextKit.configure({
    placeholder: { placeholder: '写点什么…' },
  }),
]
</script>

<template>
  <ProseharborEditorToolbar v-if="editorRef?.editor" :editor="editorRef.editor" />
  <ProseharborEditor ref="editorRef" v-model="content" :extensions="extensions" />
  <ProseharborEditorBubble v-if="editorRef?.editor" :editor="editorRef.editor" />
</template>
```

## 包含内容

`BasicKit` 的全部内容，再加上：

| 分组     | 扩展                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| 块       | `Heading`、`Blockquote`、`Divider`、`CodeBlock`                                     |
| 列表     | `BulletList`、`OrderedList`、`TaskList`、`ListItem`                                 |
| 标记     | `Bold`、`Italic`、`Underline`、`Strike`、`Code`、`Subscript`、`Superscript`、`Link` |
| 文字样式 | `TextStyle`、`Color`、`Background`、`FontFamily`、`FontSize`、`TextAlign`           |
| 复杂块   | `Table`（含 `TableRow` / `TableHeader` / `TableCell`）、`Image`                     |
| 元数据   | `UniqueID`、`Toc`                                                                   |

## 默认覆盖

```ts
Color.configure({ type: 'picker' })
Background.configure({ type: 'picker' })
Table.configure({})
```

`type: 'picker'` 让颜色与背景按钮打开完整的 `IColorPicker` 面板，而不是紧凑色块行。

## 配置项

规则与 `BasicKit` 一致——每个扩展对应一个同名选项，传对象即配置，传 `false` 即移除：

```ts
RichTextKit.configure({
  heading: { levels: [1, 2, 3] },
  placeholder: { placeholder: '写点什么…' },
  image: {
    uploadImage: async (file) => {
      /* -> url */
    },
  },
  color: { type: 'picker' },
  background: { type: 'picker' },
  table: false, // 不要表格
  taskList: false, // 不要复选框
})
```

常用选项：

| 选项         | 类型              | 说明                                            |
| ------------ | ----------------- | ----------------------------------------------- |
| `heading`    | `object \| false` | `{ levels: [1,2,3,4,5,6] }`                     |
| `image`      | `object \| false` | `{ uploadImage }`、`{ allowBase64 }`            |
| `link`       | `object \| false` | 链接标记，`openOnClick`、`autolink` 等          |
| `textAlign`  | `object \| false` | `{ alignments, defaultAlignment, types }`       |
| `fontSize`   | `object \| false` | `{ type: 'default' \| 'complex' }`              |
| `fontFamily` | `object \| false` | `{ fonts: [{ value, label }] }`                 |
| `codeBlock`  | `object \| false` | `{ useTab, tabSize, defaultLanguage, … }`       |
| `uniqueID`   | `object \| false` | `{ types: ['paragraph'], attributeName: 'id' }` |
| `toc`        | `object \| false` | `{ levels: [1,2,3,4,5,6] }`                     |

## 图片上传

未配置 `uploadImage` 时，图片会以 base64 内联，且超过 **2 MB** 会被拒绝：

```ts
RichTextKit.configure({
  image: {
    uploadImage: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const { url } = await fetch('/api/upload', { method: 'POST', body: form }).then((r) =>
        r.json(),
      )
      return url
    },
  },
})
```

## 目录

套件包含 `Toc`，因此可以直接渲染 `<ProseharborEditorToc>`：

```vue
<ProseharborEditorToc v-if="editorRef?.editor" :editor="editorRef.editor" />
```

## Markdown 输入规则

`enableInputRules` 保持默认即可获得：

| 输入             | 结果          |
| ---------------- | ------------- |
| `# ` … `###### ` | 一 ~ 六级标题 |
| `> `             | 引用块        |
| `- ` / `* `      | 无序列表      |
| `1. `            | 有序列表      |
| `[] ` / `[x] `   | 任务列表      |
| `--- ` / `*** `  | 分割线        |
| ` ``` `          | 代码块        |
| `==文本==`       | 背景高亮      |

## 下一步

- [Notion 套件](./notion)——增加 `/` 命令与块拖拽。
- [扩展参考](../extensions/overview)
