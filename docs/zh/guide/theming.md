# 主题

## 样式文件

`@proseharbor-editor/vue3` 发布两个样式文件：

| 引入                                   | 是否必须 | 用途                                                                  |
| -------------------------------------- | -------- | --------------------------------------------------------------------- |
| `@proseharbor-editor/vue3/style.css`   | ✅       | 完整编辑器 UI：内容区、工具栏、气泡菜单、斜杠菜单、目录、Prism 主题。 |
| `@proseharbor-editor/vue3/content.css` | 可选     | 在编辑器**之外**只读展示内容时使用。                                  |

```ts
import '@proseharbor-editor/vue3/style.css'
```

::: warning
尽管组件内部也会 `import` 自己的 SCSS（打包器可能自动注入），仍请显式引入
`style.css`——包声明了
`sideEffects: ["**/*.css", "**/preload-icons.ts"]`，在开启 tree-shaking 的配置下
样式可能被丢弃。
:::

### 在外部渲染已保存的 HTML

给展示容器加上 `proseharbor-editor-content` 类，并引入 `content.css`：

```vue
<script setup lang="ts">
import '@proseharbor-editor/vue3/content.css'
defineProps<{ html: string }>()
</script>

<template>
  <div class="proseharbor-editor-content" v-html="html" />
</template>
```

## 亮色 / 暗色

```vue
<template>
  <ProseharborEditor v-model="content" theme="dark" :extensions="extensions" />
</template>
```

`theme` 只接受 `'light'`（默认）或 `'dark'`，其它值会被忽略并在控制台告警。
其原理是调用 `changeTheme()`，在 `<body>` 上写入 `proseharbor-theme` 属性：

```html
<body proseharbor-theme="dark"></body>
```

也可以自己控制：

```ts
import { changeTheme, toggleTheme } from '@proseharbor-editor/vue3'

changeTheme('dark')
toggleTheme()
```

::: tip
`changeTheme()` 在 SSR（无 `document`）下为空操作，可安全地在 `setup()` 中调用。
:::

## CSS 变量

所有视觉令牌都是形如下式的 CSS 变量：

```
--proseharbor-editor-{type}-{name}
```

可全局覆盖：

```css
:root {
  --proseharbor-editor-theme-primary: #3b82f6;
  --proseharbor-editor-theme-primary-val: 59, 130, 246; /* rgb 三元组 */
  --proseharbor-editor-bg-color: #ffffff;
  --proseharbor-editor-border-color: #e5e7eb;
  --proseharbor-editor-color-blue: #2563eb;
  --proseharbor-editor-font-size: 14px;
}
```

暗色取值定义在 `[proseharbor-theme='dark']` 选择器下，因此要同时覆盖两种主题
需要写两遍：

```css
:root {
  --proseharbor-editor-bg-color: #fff;
}
[proseharbor-theme='dark'] {
  --proseharbor-editor-bg-color: #1f2328;
}
```

## 类名前缀

所有类名均以 `proseharbor-editor` 为前缀：

| 元素         | 类名                                      |
| ------------ | ----------------------------------------- |
| 编辑器根节点 | `.proseharbor-editor-editor-root`         |
| 编辑区容器   | `.proseharbor-editor-prosemirror-wrapper` |
| 可编辑内容   | `.proseharbor-editor.ProseMirror`         |
| 工具栏       | `.proseharbor-editor-toolbar-menu`        |
| 气泡菜单     | `.proseharbor-editor-bubble-menu`         |
| 斜杠菜单     | `.proseharbor-editor-slash-menu`          |
| 目录         | `.proseharbor-editor-toc`                 |
| 只读展示容器 | `.proseharbor-editor-content`             |

节点级类名同样由该前缀派生，例如 `.proseharbor-editor__paragraph`、
`.proseharbor-editor__heading`、`.proseharbor-editor__code`、
`.proseharbor-editor__table`、`.proseharbor-editor__image`。

```css
.proseharbor-editor__paragraph {
  margin: 0.5em 0;
}
```

## 图标

菜单图标通过 `@iconify/vue` 渲染自私有图标集 `proseharbor-editor`。菜单名会被
转为 kebab-case，因此 `addColumnAfter` 菜单对应图标
`proseharbor-editor:add-column-after`。

```vue
<script setup lang="ts">
import { IIcon } from '@proseharbor-editor/vue3'
</script>

<template>
  <IIcon name="bold" size="1.2em" />
  <!-- -> proseharbor-editor:bold -->
</template>
```
