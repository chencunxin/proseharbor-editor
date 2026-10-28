<template>
  <div
    class="w-full h-full flex flex-col border-2 border-solid border-[var(--proseharbor-editor-border-color)] rounded-2 box-border"
    uno-focus-within="border-[var(--vp-c-brand)] shadow-[var(--vp-shadow-5)]"
  >
    <div class="w-full flex-1">
      <ProseharborEditorBubble v-if="editorEl?.editor" :sort="[]" :editor="editorEl?.editor" />
      <ProseharborEditor
        ref="editorEl"
        :spellcheck="true"
        v-model="content"
        :locale="locale"
        :theme="theme"
        :extensions="extensions"
      ></ProseharborEditor>
    </div>
    <div
      class="w-full border-t border-t-solid border-t-[var(--proseharbor-editor-border-color)] box-border"
    >
      <ProseharborEditorToolbar
        v-if="editorEl?.editor"
        :sort="toolbar"
        :editor="editorEl?.editor"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ProseharborEditor,
  ProseharborEditorToolbar,
  ProseharborEditorBubble,
  BasicKit,
} from '@proseharbor-editor/vue3'
import { Bold, Italic, Underline, Strike, Link, Code } from '@proseharbor-editor/core'

const props = defineProps({
  locale: {
    type: String,
    default: 'zh',
  },
  theme: {
    type: String,
    default: 'light',
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const editorEl = ref(null)
const content = ref('')
const extensions = [
  BasicKit.configure({
    placeholder: {
      placeholder: props.placeholder,
    },
  }),
  Bold,
  Italic,
  Underline,
  Strike,
  Link,
  Code,
]
const toolbar = ['bold', 'italic', 'underline', 'strike', 'code', 'link', '|', 'textClear']
</script>
