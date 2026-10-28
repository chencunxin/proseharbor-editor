<template>
  <div class="container">
    <div class="toolbar">
      <!--
        sort 决定工具栏显示哪些按钮：
        - 字符串：按 name 找到同名扩展，把它的 options 展开成菜单项
        - '|'：分割线
        - 对象：直接内联一个菜单项（无需对应扩展）
      -->
      <ProseharborEditorToolbar
        v-if="editorRef?.editor"
        :editor="editorRef?.editor"
        :code-view="editorRef?.isCodeView"
        :sort="toolbarSort"
      >
        <!--
          与菜单同名的插槽可以完全接管渲染（工具栏、气泡菜单都支持）。
          图标就不受内置图标集限制，用任意 SVG / 组件 / 文字都行。
        -->
        <template #callout="{ editor, command, isActive }">
          <IButton :active="isActive({ editor })" @click="command({ editor })">
            <svg class="custom-icon" viewBox="0 0 24 24" width="14" height="14">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 5h16v14H4zM8 9h8M8 13h5"
              />
            </svg>
          </IButton>
        </template>
      </ProseharborEditorToolbar>
    </div>
    <div class="editor">
      <div class="editor-content">
        <ProseharborEditor
          ref="editorRef"
          v-model="content"
          locale="zh"
          :extensions="extensions"
          @update="editorUpdate"
        ></ProseharborEditor>
      </div>
      <!-- 气泡菜单同理：sort 里加上扩展名即可 -->
      <ProseharborEditorBubble
        v-if="editorRef?.editor"
        :editor="editorRef?.editor"
        :sort="bubbleSort"
      ></ProseharborEditorBubble>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import '@proseharbor-editor/vue3/style.css'
import {
  ProseharborEditor,
  ProseharborEditorToolbar,
  ProseharborEditorBubble,
  RichTextKit,
  createSlashSuggestion,
  IButton,
} from '@proseharbor-editor/vue3'
import { CommandSlash } from '@proseharbor-editor/core'
import type { Editor } from '@proseharbor-editor/core'
import { Highlight, Callout } from './extensions'

// 组件 expose：editor（编辑器实例）、isFocused / isEmpty / isCodeView（已解包）
type EditorExpose = {
  editor?: Editor
  isFocused?: boolean
  isEmpty?: boolean
  isCodeView?: boolean
  toggleCodeView?: () => void
}

const editorRef = ref<EditorExpose | null>(null)

const content = ref(
  '<p>选中文字试试气泡菜单里的高亮，输入 “/” 试试斜杠菜单里的「高亮」「提示块」。</p>',
)

const extensions = [
  RichTextKit.configure({
    placeholder: { placeholder: '输入 / 唤起斜杠菜单' },
  }),
  // RichTextKit 不带斜杠菜单（NotionKit 自带），需要自己注册
  CommandSlash.configure(createSlashSuggestion()),
  // 自定义扩展，options 里的菜单元信息（name / command / isActive / slash）决定它在菜单中的表现
  Highlight,
  Callout,
]

// 也可以直接内联菜单项对象（不必对应某个扩展）：
// const inlineItem = {
//   name: 'highlight',
//   command: ({ editor }: { editor: Editor }) => editor.chain().focus().toggleHighlight().run(),
//   isActive: ({ editor }: { editor: Editor }) => editor.isActive('highlight'),
// }
const toolbarSort: (string | Record<string, unknown>)[] = [
  'history',
  '|',
  'bold',
  'italic',
  'underline',
  'strike',
  '|',
  'highlight',
  'callout',
  '|',
  'bulletList',
  'orderedList',
  '|',
  'codeView',
]

const bubbleSort: (string | Record<string, unknown>)[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  '|',
  'highlight',
  'callout',
]

function editorUpdate({ editor }: { editor: Editor }) {
  console.log('editor update', editor.getHTML().length)
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;

  .toolbar {
    height: 40px;
    border-bottom: 1px solid #eee;
    box-sizing: border-box;
  }

  .editor {
    flex: 1;
    position: relative;
    overflow-x: auto;

    .editor-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  .custom-icon {
    vertical-align: middle;
  }

  // 自定义节点 / 标记的样式（:deep 才能作用到 ProseMirror 渲染的内容上）
  :deep(.proseharbor-editor__callout) {
    margin: 0.5rem 0;
    padding: 0.6rem 0.8rem;
    border-left: 3px solid rgb(var(--proseharbor-editor-theme-primary-val, 33 150 243));
    background: var(--proseharbor-editor-bg-gray, #f7f7f7);

    &[data-variant='warning'] {
      border-left-color: #f59f00;
      background: #fff9db;
    }

    &[data-variant='danger'] {
      border-left-color: #e03131;
      background: #fff5f5;
    }
  }

  :deep(mark.custom-highlight) {
    background-color: #ffe066;
    color: inherit;
  }
}
</style>
