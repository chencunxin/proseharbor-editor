import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const resolvePath = (...segments: string[]) => path.resolve(rootDir, ...segments)

/**
 * 只把 dependencies / peerDependencies 外部化，devDependencies 会被打进产物
 */
const pkgManifest = JSON.parse(readFileSync(resolvePath('package.json'), 'utf8')) as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const externalPackages = new Set([
  ...Object.keys(pkgManifest.dependencies ?? {}),
  ...Object.keys(pkgManifest.peerDependencies ?? {}),
])

const isExternalPackage = (id: string) => {
  if (externalPackages.has(id)) return true
  // 处理子路径导入：@tiptap/pm/state -> @tiptap/pm，lodash/isEqual -> lodash
  const segments = id.split('/')
  const name = id.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0]
  return externalPackages.has(name)
}

export default defineConfig({
  resolve: {
    alias: {
      '@': resolvePath('src'),
    },
  },
  plugins: [
    dts({
      tsconfigPath: resolvePath('tsconfig.build.json'),
      entryRoot: 'src',
      include: ['src'],
      outDir: 'dist',
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: true,
    cssCodeSplit: false,
    emptyOutDir: false,
    lib: {
      entry: resolvePath('src/index.ts'),
      name: 'ProseHarborEditor',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      // dependencies / peerDependencies 外部化，其余（含 devDependencies）打进产物
      external: (id) => isExternalPackage(id),
      output: {
        assetFileNames: 'style[extname]',
        exports: 'named',
        // 对齐旧 rollup 配置的 cjs 互操作行为（兼容 require 默认导出的写法）
        interop: 'compat',
      },
    },
  },
})
