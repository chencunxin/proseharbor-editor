<template>
  <div
    class="w-full h-full flex flex-col border-2 border-solid border-[var(--proseharbor-editor-border-color)] rounded-2 box-border"
    uno-focus-within="border-[var(--vp-c-brand)] shadow-[var(--vp-shadow-5)]"
  >
    <div
      class="w-full border-b border-b-solid border-b-[var(--proseharbor-editor-border-color)] box-border"
    >
      <!-- <div
        class="w-full h-52px px-1rem flex justify-between border-b border-b-solid border-b-[var(--proseharbor-editor-border-color)] box-border"
      >
        <div></div>
        <div class="h-full">
          <div
            class="h-full flex flex-col justify-center items-end text-11px leading-4.5"
          >
            <span>{{ words || 0 }} words</span>
            <span>{{ characters || 0 }} characters</span>
          </div>
        </div>
      </div> -->
      <ProseharborEditorToolbar v-if="editorEl?.editor" :editor="editorEl?.editor" />
    </div>
    <div class="w-full flex-1">
      <ProseharborEditorBubble v-if="editorEl?.editor" :editor="editorEl?.editor" />
      <div class="w-full max-w-screen-md mx-auto">
        <ProseharborEditor
          class="px-2rem py-1rem"
          ref="editorEl"
          :spellcheck="true"
          v-model="content"
          :locale="locale"
          :theme="theme"
          :extensions="extensions"
        ></ProseharborEditor>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ProseharborEditor,
  ProseharborEditorToolbar,
  ProseharborEditorBubble,
  NotionKit,
} from '@proseharbor-editor/vue3'

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
  defaultContent: {
    type: String,
    default: '',
  },
})

const editorEl = ref(null)
const content = ref(props.defaultContent)
const extensions = [
  NotionKit.configure({
    placeholder: {
      placeholder: props.placeholder,
    },
  }),
]
</script>
