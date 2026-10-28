<template>
  <div class="container">
    <TiptapEditor v-model="content" />
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import TiptapEditor from '../components/RichTextEditor.vue'
const content = ref('')

watch(
  () => content.value,
  () => {
    console.log(content.value)
  },
)

onMounted(() => {
  content.value =
    '<p class="proseharbor-editor__paragraph" data-id="38a4c68b-6616-4867-94f6-436c6b68e7eb">hello word</p><div class="proseharbor-editor__image-wrapper"><img class="proseharbor-editor__image" src="https://images.pexels.com/photos/16715939/pexels-photo-16715939.jpeg?auto=compress&amp;w=600" alt="123" style="vertical-align: bottom;" /><span class="proseharbor-editor__image-resize-handle proseharbor-editor__image-resize-handle--nw" data-position="nw"></span><span class="proseharbor-editor__image-resize-handle proseharbor-editor__image-resize-handle--ne" data-position="ne"></span><span class="proseharbor-editor__image-resize-handle proseharbor-editor__image-resize-handle--sw" data-position="sw"></span><span class="proseharbor-editor__image-resize-handle proseharbor-editor__image-resize-handle--se" data-position="se"></span></div>'
})
</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
