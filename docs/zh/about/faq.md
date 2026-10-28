# 常见问题

## 通用

### `useEditor()` 是真实 API 吗？

不是。`useEditor`、`createEditor()`、`run()` 出现在早期的 README 中，但**并未实现**。
请使用：

- `@proseharbor-editor/core` 的 `new Editor(options)`，或
- `<ProseharborEditor>` 并从模板 ref 读取实例（`editorRef.value.editor`）。

### 组件名是 `ProseHarborEditor` 还是 `ProseharborEditor`？

是 `ProseharborEditor`——`h` 小写。`ProseharborEditorToolbar`、
`ProseharborEditorBubble`、`ProseharborEditorSlash`、`ProseharborEditorToc` 同理。

### 套件在哪个包里？

在 `@proseharbor-editor/vue3`：

```ts
import { BasicKit, RichTextKit, NotionKit } from '@proseharbor-editor/vue3'
```

内核包不导出套件。

### 可以不用 Vue 只用内核吗？

可以——`@proseharbor-editor/core` 不依赖任何框架，只是菜单需要你自己实现。

## 使用

### 为什么占位提示不显示？

组件没有 `placeholder` 属性，需要配置 `Placeholder` 扩展：

```ts
RichTextKit.configure({ placeholder: { placeholder: '写点什么…' } })
```

### 为什么菜单按钮没反应 / 消失了？

工具栏项按扩展名解析，如果对应扩展不在 schema 中，该项会被静默丢弃。可检查
`editor.extensionManager.extensions` 里是否有同名扩展。

### 传了 `extensions` 却什么都没渲染？

Vue 组件会过滤该数组，只保留 `type` 为 `extension`、`node` 或 `mark` 的项，
普通对象会被移除。

### 如何输出 JSON 而不是 HTML？

```vue
<ProseharborEditor v-model="json" output="json" :extensions="extensions" />
```

### 为什么编辑器一直在重置我的 `v-model`？

只有在你确实想替换整篇文档时才从外部修改 `v-model`——外部变更会调用
`setContent(value, { emitUpdate: false })`。若只是想读取内容，请监听 `@update`。

### `editor.isCodeView` 行为异常

在**实例**上它是 `Ref`（`editor.isCodeView.value`）；在组件暴露的对象上已解包
（`editorRef.value.isCodeView`）。

### `getCharacters()` 返回了 Error

说明 schema 中没有 `CharacterCount`。请加上它（所有套件都已包含），或直接读取
`editor.storage.characterCount`。

### 大图上传失败

未配置 `uploadImage` 时图片会内联为 base64，超过 **2 MB** 会被拒绝。请提供上传函数：

```ts
RichTextKit.configure({ image: { uploadImage: async (file) => url } })
```

### 自定义的气泡菜单项渲染不出来？

`BubbleSelector` 调用 `menu.isActive({ editor })` 时没有做空值保护，因此给
`ProseharborEditorBubble` 添加自定义项时必须提供 `isActive`。

## 样式

### 编辑器没有样式

请引入样式文件：

```ts
import '@proseharbor-editor/vue3/style.css'
```

### 如何在编辑器之外渲染已保存的 HTML？

```ts
import '@proseharbor-editor/vue3/content.css'
```

```html
<div class="proseharbor-editor-content" v-html="html"></div>
```

### 如何切换到暗色？

```vue
<ProseharborEditor theme="dark" />
```

或用 `changeTheme('dark')` / `toggleTheme()` 命令式切换。仅支持 `'light'` 与 `'dark'`。

## 国际化

### 默认语言是中文，界面为什么是英文？

内核用 `zh` 初始化 i18next，但 Vue 组件的 `locale` 属性默认是 `'en'`，并且会在挂载时
调用 `changeLocale()`。需要中文请显式设置 `locale="zh"`。

### 如何新增语言？

```ts
addLocale('fr', { bold: 'Gras' /* … */ })
changeLocale('fr')
```

## 参与贡献

### 如何运行文档站与演示项目？

```bash
yarn install
yarn dev        # 演示项目
yarn docs:dev   # 本文档站
```
