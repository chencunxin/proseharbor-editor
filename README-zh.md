# proseharbor-editor

[![NPM](https://img.shields.io/npm/v/%40proseharbor-editor%2Fcore.svg)](https://www.npmjs.com/package/@proseharbor-editor/core)

[![GitHub](https://img.shields.io/github/stars/chencunxin/proseharbor-editor.svg?style=social)](https://github.com/chencunxin/proseharbor-editor)

[English](./README.md)

## 介绍

**Proseharbor Editor** 是基于 [ProseMirror](https://prosemirror.net/) 与
[Tiptap](https://tiptap.dev/) 构建的开源 Web 编辑器。我们的目标是让开发者能轻松地
为应用添加文本编辑能力——既可以是传统富文本编辑器（输出 HTML），也可以是块级 /
Notion 风格编辑器（输出 JSON）。

与其它开源编辑器相比，Proseharbor Editor 还很年轻，并专注在两件事上：

1. **立刻可用**——内置套件、菜单、主题与语言包，三行代码就能跑起来。
2. **完全可扩展**——可以用内置套件，可以挑选内核扩展逐个拼装，也可以用标准
   Tiptap API 编写自己的扩展。

## Repository layout

| 目录            | 包名                       | 说明                                             |
| --------------- | -------------------------- | ------------------------------------------------ |
| `packages/core` | `@proseharbor-editor/core` | 无框架编辑器内核（ESM + CJS + d.ts + style.css） |
| `packages/vue3` | `@proseharbor-editor/vue3` | Vue 3 组件 `<ProseHarborEditor>` 与 `useEditor`  |
| `docs`          | —                          | VitePress 文档站                                 |
| `playground`    | —                          | Vue 3 本地演示                                   |

## 快速开始

```bash
yarn install
yarn dev            # 启动 playground（http://localhost:5173）
yarn docs:dev       # 启动文档站
yarn build          # 构建全部 workspace
yarn build:packages # 只构建待发布的包
yarn typecheck      # 类型检查
yarn lint           # ESLint（TS + Vue）
```

## 特性

- **开箱即用**: 使用简单，只需几行代码即可快速接入，无需复杂配置。
- **可扩展**: 内置丰富的可插拔扩展、视图组件，支持自定义。
- **可定制**: 支持自定义主题样式，内置 `light`、`dark` 两种主题。
- **多语言**: 支持多语言编辑，内置中文、英文，可自由扩展更多语言。
- **灵活**: 支持多种编辑模式，如块编辑、富文本、`WYSIWYG`、`Markdown`、`Notion Style` 编辑等。
- **高性能**: 基于 `prosemirror` 和 `tiptap` 的高性能实现，提供流畅的编辑体验。

## License

[MIT](./LICENSE)
