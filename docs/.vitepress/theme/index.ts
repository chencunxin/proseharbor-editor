import type { App } from 'vue'
import DefaultTheme from 'vitepress/theme'
import CustomLayout from './components/CustomLayout.vue'
import { ProseharborEditor } from '@proseharbor-editor/vue3'
import '@proseharbor-editor/vue3/dist/style.css'
import { ElementPlusContainer } from '@vitepress-demo-preview/component'
import '@vitepress-demo-preview/component/dist/style.css'

import { MotionPlugin } from '@vueuse/motion'

import './styles/vars.css'
import './styles/main.css'
import 'uno.css'

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app }: { app: App }) {
    app.component('ProseharborEditor', ProseharborEditor)
    app.component('demo-preview', ElementPlusContainer)
    app.use(MotionPlugin)
  },
}
