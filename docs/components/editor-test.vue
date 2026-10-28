<template>
  <div>
    <proseharbor-editor-bubble
      v-if="editorEl?.editor"
      :editor="editorEl.editor"
    ></proseharbor-editor-bubble>
    <proseharbor-editor
      ref="editorEl"
      v-model="content"
      :extensions="extensions"
    ></proseharbor-editor>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Heading,
  OrderedList,
  BulletList,
  TaskList,
  Blockquote,
  Divider,
  Italic,
  Strike,
  Underline,
  Subscript,
  Superscript,
  Bold,
  Code,
  Link,
  Background,
  Color,
  TextAlign,
  UniqueID,
  Toc,
  CommandSlash,
  DragHandle,
  Placeholder,
  t,
} from '@proseharbor-editor/core'
import { createSlashSuggestion, ProseharborEditorBubble } from '@proseharbor-editor/vue3'

const extensions = [
  Heading,
  OrderedList,
  BulletList,
  TaskList,
  Blockquote,
  Divider,
  Italic,
  Strike,
  Underline,
  Subscript.configure({
    bubble: false,
  }),
  Superscript.configure({
    bubble: false,
  }),
  Bold,
  Code,
  Link,
  Background,
  Color,
  TextAlign,
  UniqueID.configure({
    types: ['heading', 'paragraph', 'bulletList', 'orderedList', 'taskList'],
  }),
  Toc.configure({
    levels: [1, 2, 3],
  }),
  CommandSlash.configure(createSlashSuggestion()),
  DragHandle,
  Placeholder.configure({
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case 'heading': {
          return t(`heading${node.attrs.level}`)
        }
        case 'bulletList':
        case 'orderedList':
        case 'taskList':
        case 'codeBlock': {
          return ''
        }
      }
      return 'Write something, or "/" for commands'
    },
  }),
]
const content = ref('')
const editorEl = ref(null)
</script>
