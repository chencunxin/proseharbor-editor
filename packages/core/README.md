# @proseharbor-editor/core

基于 [ProseMirror](https://prosemirror.net/) 的轻量、可插拔富文本编辑器内核，无框架依赖。

## 安装

```bash
yarn add @proseharbor-editor/core
```

## 使用

```ts
import { createEditor, run, toggleBold } from '@proseharbor-editor/core'
import '@proseharbor-editor/core/style.css'

const editor = createEditor({
  target: '#editor',
  placeholder: '开始输入…',
  content: '<p>Hello <strong>ProseHarbor</strong></p>',
  onChange: ({ html, json, text, empty }) => console.log(html, json, text, empty),
})

run(editor.view, toggleBold)

editor.getHTML()
editor.setContent('<h2>新内容</h2>')
editor.destroy()
```

## 能力

- 标题、列表、引用、代码块、分割线、链接、加粗/斜体/下划线/删除线/行内代码
- Markdown 输入规则（`# `、`- `、`1. `、`> `、` ``` `）
- 常用快捷键（`Mod-B/I/U`、`Mod-Shift-8/9/0`、`Tab`/`Shift-Tab` 列表缩进）
- 撤销/重做、占位提示、受控 `onChange`
- 暴露底层 `EditorView`，可追加自定义 ProseMirror 插件

完整文档见仓库 `docs/`（VitePress）：`yarn docs:dev`。

## License

MIT
