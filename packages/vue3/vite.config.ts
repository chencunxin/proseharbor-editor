import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const resolvePath = (...segments: string[]) => path.resolve(rootDir, ...segments)

/**
 * UMD 构建时，外部依赖对应的全局变量名
 * （用于 CDN <script> 直出场景）
 */
const globals: Record<string, string> = {
  vue: 'Vue',
  '@proseharbor-editor/core': 'ProseharborEditorCore',
  'tippy.js': 'tippy',
  uuid: 'uuid',
  prismjs: 'Prism',
  '@iconify/vue': 'IconifyVue',
}

const fileName = (format: string) => {
  if (format === 'cjs') return 'index.cjs'
  if (format === 'umd') return 'index.umd.js'
  return 'index.js'
}

export default defineConfig({
  resolve: {
    alias: {
      '@': resolvePath('src'),
    },
  },
  plugins: [vue()],
  build: {
    target: 'es2020',
    sourcemap: true,
    cssCodeSplit: false,
    emptyOutDir: false,
    lib: {
      entry: resolvePath('src/index.ts'),
      name: 'ProseHarborVue',
      formats: ['es', 'cjs', 'umd'],
      fileName,
    },
    rollupOptions: {
      // prismjs 及其组件打包进产物，其余裸模块保持外部化
      external: (id) =>
        id !== 'prismjs' &&
        !id.startsWith('prismjs/') &&
        !id.startsWith('.') &&
        !id.startsWith('\0') &&
        !path.isAbsolute(id),
      output: {
        assetFileNames: 'style[extname]',
        exports: 'named',
        globals,
      },
    },
  },
})
