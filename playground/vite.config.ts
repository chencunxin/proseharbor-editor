import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import {
  ArcoResolver,
  VueUseComponentsResolver,
  VueUseDirectiveResolver,
} from 'unplugin-vue-components/resolvers'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    exclude: ['@proseharbor-editor/core', '@proseharbor-editor/vue3'],
    include: ['lodash/isEqual', 'lodash/debounce'],
    entries: ['./src/**/*.vue', './src/**/*.js'],
  },
  server: {
    host: '0.0.0.0',
    port: 9999,
    open: true,
    strictPort: true,
    cors: true,
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    UnoCSS({
      configFile: './unocss.config.ts',
    }),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: ['vue', 'pinia', 'vue-router', 'vue-i18n', '@vueuse/core'],
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
      resolvers: [ArcoResolver()],
    }),
    Components({
      dirs: ['src/components/', 'src/views/', 'src/layout'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ArcoResolver({
          sideEffect: true,
        }),
        VueUseComponentsResolver(),
        VueUseDirectiveResolver(),
        IconsResolver({
          prefix: 'icon',
          customCollections: ['proseharbor'],
        }),
      ],
    }),
    Icons({
      compiler: 'vue3',
      customCollections: {
        proseharbor: FileSystemIconLoader('src/assets/svg/proseharbor', (svg) =>
          svg.replace(/^<svg /, '<svg fill="currentColor" '),
        ),
      },
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@proseharbor-editor/core': fileURLToPath(new URL('../packages/core/dist', import.meta.url)),
      '@proseharbor-editor/vue3': fileURLToPath(new URL('../packages/vue3/dist', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
})
