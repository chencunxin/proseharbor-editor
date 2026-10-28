import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const resolvePath = (...segments: string[]) => path.resolve(rootDir, ...segments)

/**
 * 自包含 UMD 构建
 *
 * 与主构建（vite.config.ts，所有裸模块外部化）不同：
 * 这里把 @tiptap/*、prosemirror-*、lodash、i18next、uuid、@floating-ui/dom 全部打进产物，
 * 供 vue3 包的 UMD 或其他 CDN <script> 场景以全局变量 ProseharborEditorCore 使用。
 *
 * 注意：cheerio 仅被 Node 端工具 sanitize-html-node 使用，且未从 src/index.ts 导出，不会被打进来。
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolvePath('src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    cssCodeSplit: false,
    // 主构建产物已生成，这里不能清空目录
    emptyOutDir: false,
    lib: {
      entry: resolvePath('src/index.ts'),
      name: 'ProseharborEditorCore',
      formats: ['umd'],
      fileName: () => 'index.umd.js',
    },
    rollupOptions: {
      // 自包含：不外部化任何依赖
      external: [],
      output: {
        assetFileNames: 'style[extname]',
        exports: 'named',
      },
    },
  },
})
