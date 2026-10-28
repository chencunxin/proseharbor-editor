<template>
  <div class="editor-container">
    <div class="toolbar">
      <ProseharborEditorToolbar
        v-if="editorRef?.editor"
        :editor="editorRef?.editor"
        :code-view="editorRef?.isCodeView"
      ></ProseharborEditorToolbar>
    </div>
    <div class="editor">
      <div class="editor-content">
        <ProseharborEditor
          locale="zh"
          v-model="modelValue"
          :extensions="extensions"
          ref="editorRef"
          @update="editorUpdate"
        ></ProseharborEditor>
      </div>
      <ProseharborEditorBubble
        v-if="editorRef?.editor"
        :editor="editorRef?.editor"
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
} from '@proseharbor-editor/vue3'
import { sanitizeHtml } from '@proseharbor-editor/core'
import type { Editor } from '@proseharbor-editor/core'

// import uploader from '@/utils/uploader'; //

const modelValue = defineModel({
  type: String,
  default: '',
})

// 组件 expose：editor（编辑器实例）、isFocused / isEmpty / isCodeView（已解包）
type EditorExpose = {
  editor?: Editor
  isFocused?: boolean
  isEmpty?: boolean
  isCodeView?: boolean
  toggleCodeView?: () => void
}

const editorRef = ref<EditorExpose | null>(null)
const extensions = ref([
  RichTextKit.configure({
    placeholder: {
      placeholder: '',
    },
    image: {
      uploadImage: async (file: File) => {
        // 自定义上传逻辑
        // 这里是一个示例：上传到服务器并返回URL
        try {
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('上传失败')
          }

          const data = await response.json()
          return data.url // 返回图片URL
        } catch (error) {
          console.error('图片上传失败:', error)
          // 可以显示错误提示给用户
          alert('图片上传失败，请重试')
          return null
        }
      },
    },
  }),
])

function editorUpdate({ editor }: { editor: Editor; output?: string }) {
  const html = editor.getHTML()
  const cleanHtml = sanitizeHtml(html, { inlineStyles: true })
  // 需要时可用 output（本次更新的实时最新内容）
  console.log('editor update', html.length, cleanHtml.length)
}
</script>
<style lang="scss" scoped>
.editor-container {
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
}
</style>
