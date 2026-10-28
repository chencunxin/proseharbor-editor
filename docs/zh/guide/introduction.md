# 介绍

## 什么是 Proseharbor Editor？

`proseharbor-editor` 是基于 [ProseMirror](https://prosemirror.net/) 与
[Tiptap](https://tiptap.dev/) 构建的开源 Web 编辑器，开箱即用、可深度定制。

它既可以作为传统富文本编辑器使用（输出 **HTML**），也可以作为块级 /
Notion 风格编辑器使用（输出 **JSON**），取决于你的配置。

## 包结构

| 包                         | 路径            | 说明                                                                                  |
| -------------------------- | --------------- | ------------------------------------------------------------------------------------- |
| `@proseharbor-editor/core` | `packages/core` | 无框架内核：`Editor` 类、40+ 扩展、国际化、工具函数。                                 |
| `@proseharbor-editor/vue3` | `packages/vue3` | Vue 3 适配层：`ProseharborEditor` 组件、套件、工具栏 / 气泡 / 斜杠 / 目录菜单、样式。 |

两个包均提供 ESM、CJS、UMD 产物与类型声明。

## 特性

- **开箱即用的富文本**——加粗、斜体、下划线、删除线、行内代码、上下标、链接、文字颜色、背景色、字体、字号、对齐。
- **块编辑 / Notion 风格**——斜杠命令菜单（`/`）、拖拽手柄、目录（TOC）、缩进、块唯一 ID。
- **Markdown 输入规则**——`# ` 生成标题、`> ` 生成引用、`--- ` 生成分割线、`==文本==` 高亮、` ``` ` 生成代码块等。
- **框架友好**——内核不依赖任何 UI 框架；Vue 3 包提供组件与成套菜单。
- **国际化**——内置 `zh`、`en`、`de` 三种语言，新增语言只需一次函数调用。
- **主题**——亮色 / 暗色主题，以及一整套 CSS 变量（`--proseharbor-editor-*`）。
- **HTML 或 JSON 输出**——一个 `output` 属性即可切换。
- **类型安全**——全量 TypeScript 编写，命令与配置项均有类型声明。

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│ @proseharbor-editor/vue3                                     │
│   ProseharborEditor  ProseharborEditorToolbar                │
│   ProseharborEditorBubble  ProseharborEditorSlash            │
│   ProseharborEditorToc   BasicKit / RichTextKit / NotionKit  │
└───────────────────────────┬─────────────────────────────────┘
                            │ 依赖
┌───────────────────────────▼─────────────────────────────────┐
│ @proseharbor-editor/core                                    │
│   Editor（继承 @tiptap/core 的 Editor）                      │
│   Node / Mark / Extension   Locales（i18next）   Utils       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│ Tiptap v3 / ProseMirror                                     │
└─────────────────────────────────────────────────────────────┘
```

`@proseharbor-editor/core` 会整体再导出 `@tiptap/core`，因此
`EditorOptions`、`commands`、`chain()`、`Node`、`Mark`、`Extension` 等 Tiptap
API 都只需一次导入。

## 与 Tiptap 的关系

- 内核导出的 `Editor` 类**继承**自 Tiptap 的 `Editor`，唯一的覆写是给编辑区根节点加上 `proseharbor-editor` 类名。
- 所有内置扩展要么是官方 Tiptap 扩展的薄封装，要么是用同样的 `Node.create` / `Mark.create` / `Extension.create` 编写的自定义扩展。
- 命令即 Tiptap 命令：`editor.chain().focus().toggleBold().run()`。

在此之上，每个扩展的 options 里还携带了**菜单元信息**（`command`、
`isActive`、`isDisabled`、`shortcutkeys`、`icon`、`desc`、`slash` 等），Vue
层的菜单正是读取这些元信息来渲染按钮——这也是相比直接使用 Tiptap 的主要增量。

## 下一步

- [快速开始](./quick-start)——安装并渲染第一个编辑器。
- [核心 / 实例](../core/instance)——`Editor` 类的全部配置项。
- [Vue 3 / 快速开始](../vue3/quick-start)——组件与菜单。
- [套件](../kit/basic)——预置的扩展组合。
- [扩展](../extensions/overview)——完整的扩展参考。
