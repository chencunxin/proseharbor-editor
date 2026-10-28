import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'notion',
      component: () => import('@/views/notion-page/notion-page.vue'),
    },
    {
      path: '/rich-text',
      name: 'richText',
      component: () => import('@/views/rich-text-page/rich-text-page.vue'),
    },
    {
      path: '/custom-extension',
      name: 'customExtension',
      component: () => import('@/views/custom-extension-page/custom-extension-page.vue'),
    },
  ],
})

export default router
