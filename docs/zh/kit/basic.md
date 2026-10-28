# 基础套件

`BasicKit` 是最小的可用预设：一个合法的 schema 加上基础能力（段落、历史、换行、
缩进、占位提示）。当你想逐个添加自己的标记与节点时用它。

```ts
import { BasicKit } from '@proseharbor-editor/vue3'
```

> 套件位于 `@proseharbor-editor/vue3`，**不在**内核包中。

## 用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProseharborEditor, BasicKit } from '@proseharbor-editor/vue3'
import { Bold, Italic, Underline, Strike, Link, Code } from '@proseharbor-editor/core'
import '@proseharbor-editor/vue3/style.css'

const content = ref('')
const extensions = [
  BasicKit.configure({ placeholder: { placeholder: '写下你的想法…' } }),
  Bold,
  Italic,
  Underline,
  Strike,
  Link,
  Code,
]
</script>

<template>
  <ProseharborEditor v-model="content" :extensions="extensions" />
</template>
```

## 包含内容

| 扩展             | 类型      | 作用                                        |
| ---------------- | --------- | ------------------------------------------- |
| `Document`       | node      | 根节点（`block+`）。                        |
| `Text`           | node      | 文本节点（来自 `@tiptap/extension-text`）。 |
| `Paragraph`      | node      | 段落块。                                    |
| `HardBreak`      | node      | 换行。                                      |
| `Gapcursor`      | extension | 为不可达位置提供光标。                      |
| `Dropcursor`     | extension | 拖拽时的落点指示。                          |
| `History`        | extension | 撤销 / 重做。                               |
| `Indent`         | extension | 块缩进。                                    |
| `Typography`     | extension | 智能引号、破折号、省略号等。                |
| `CommandAKeymap` | extension | 更合理的 `Mod-A`。                          |
| `CharacterCount` | extension | 字数统计。                                  |
| `Placeholder`    | extension | 空状态占位提示。                            |

## 默认覆盖

```ts
Dropcursor.configure({
  width: 5,
  color: 'rgba(var(--proseharbor-editor-theme-primary-val), 0.3)',
  class: 'proseharbor-editor-dropcursor',
})

Placeholder.configure({ placeholder: t('placeholder') })
```

## 配置项

每个被包含的扩展都能通过同名选项配置——或禁用：

```ts
BasicKit.configure({
  // 配置
  history: { depth: 200 },
  indent: { maxIndent: 5 },
  placeholder: { placeholder: '开始输入…' },

  // 禁用
  typography: false,
  characterCount: false,
})
```

| 选项             | 类型              | 默认值                              |
| ---------------- | ----------------- | ----------------------------------- |
| `document`       | `object \| false` | `{}`                                |
| `text`           | `object \| false` | `{}`                                |
| `paragraph`      | `object \| false` | `{}`                                |
| `hardBreak`      | `object \| false` | `{}`                                |
| `gapcursor`      | `object \| false` | `{}`                                |
| `dropcursor`     | `object \| false` | 见上方默认覆盖                      |
| `history`        | `object \| false` | `{}`                                |
| `indent`         | `object \| false` | `{}`                                |
| `typography`     | `object \| false` | `{}`                                |
| `commandAKeymap` | `object \| false` | `{}`                                |
| `characterCount` | `object \| false` | `{}`                                |
| `placeholder`    | `object \| false` | `{ placeholder: t('placeholder') }` |

::: warning
禁用 `document`、`text` 或 `paragraph` 会导致 schema 非法，除非你自行提供替代节点。
:::

## 配合工具栏使用

`BasicKit` 不含任何标记，因此只有部分工具栏项能解析成功，需要显式传 `sort`：

```ts
const toolbar = ['bold', 'italic', 'underline', 'strike', 'code', 'link', '|', 'textClear']
```

```vue
<ProseharborEditorToolbar :editor="editor" :sort="toolbar" />
```

## 下一步

- [富文本套件](./richtext)——在以上基础上增加完整排版能力。
- [Notion 套件](./notion)——增加斜杠菜单与拖拽手柄。
