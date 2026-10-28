# 关于我们

## 项目简介

**Proseharbor Editor** 是基于 [ProseMirror](https://prosemirror.net/) 与
[Tiptap](https://tiptap.dev/) 构建的开源 Web 编辑器。我们的目标是让开发者能轻松地
为应用添加文本编辑能力——既可以是传统富文本编辑器（输出 HTML），也可以是块级 /
Notion 风格编辑器（输出 JSON）。

与其它开源编辑器相比，Proseharbor Editor 还很年轻，并专注在两件事上：

1. **立刻可用**——内置套件、菜单、主题与语言包，三行代码就能跑起来。
2. **完全可扩展**——可以用内置套件，可以挑选内核扩展逐个拼装，也可以用标准
   Tiptap API 编写自己的扩展。

## 仓库结构

| 目录            | 说明                                                 |
| --------------- | ---------------------------------------------------- |
| `packages/core` | `@proseharbor-editor/core`——无界面内核。             |
| `packages/vue3` | `@proseharbor-editor/vue3`——Vue 3 组件、套件、菜单。 |
| `docs`          | 本文档站（VitePress）。                              |
| `playground`    | 覆盖全部预设的本地 Vue 3 演示。                      |

仓库是使用 [Yarn 4 Workspaces](https://yarnpkg.com/) 管理、以 Vite 构建的 monorepo。

## 技术栈

- [ProseMirror](https://prosemirror.net/)——编辑引擎。
- [Tiptap v3](https://tiptap.dev/)——扩展层。
- [Vue 3](https://vuejs.org/)——视图层。
- [TypeScript](https://www.typescriptlang.org/)——全量使用。
- [Vite](https://vite.dev/)——构建。
- [i18next](https://www.i18next.com/)——国际化。
- [UnoCSS](https://unocss.dev/) 与 SCSS——样式。

## 参与贡献

```bash
git clone https://github.com/chencunxin/proseharbor-editor.git
cd proseharbor-editor
yarn install

yarn dev            # 演示项目
yarn docs:dev       # 文档站
yarn build          # 构建全部 workspace
yarn typecheck      # 类型检查
yarn lint           # ESLint
```

提交 Pull Request 前请运行 `yarn lint` 与 `yarn typecheck`，并让文档与代码保持同步。

## 许可

基于 [MIT License](https://github.com/chencunxin/proseharbor-editor/blob/main/LICENSE) 发布。
