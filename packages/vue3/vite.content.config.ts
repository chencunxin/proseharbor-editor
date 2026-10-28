import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const resolvePath = (...segments: string[]) => path.resolve(rootDir, ...segments)

/** 单独构建 content.css（编辑器内容区样式） */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolvePath('src'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    // 主构建产物已生成，这里不能清空目录
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolvePath('src/styles/content.entry.ts'),
      name: 'ProseHarborContentStyles',
      formats: ['es'],
      fileName: () => 'content.entry.js',
    },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('\0') && !path.isAbsolute(id),
      output: {
        assetFileNames: 'content[extname]',
      },
    },
  },
})
