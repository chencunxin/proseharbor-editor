import { cp } from 'node:fs/promises'
import path from 'node:path'
import { readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const resolvePath = (...segments: string[]) => path.resolve(rootDir, ...segments)

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
  const segments = id.split('/')
  const name = id.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0]
  return externalPackages.has(name)
}

/**
 * 独立构建 locales 产物
 *
 * 输出 dist/locales：
 * - index.js：多语言 API（addLocale / changeLocale / getLocale / t）
 * - *.json：原始语言包，方便使用方直接复用或覆盖
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolvePath('src'),
    },
  },
  plugins: [
    {
      name: 'copy-locale-resources',
      async closeBundle() {
        await cp(resolvePath('src/locales'), resolvePath('dist/locales'), {
          recursive: true,
          // 目录必须放行，否则 cp 不会递归进去；只保留 .json 语言包
          filter: (source) => statSync(source).isDirectory() || source.endsWith('.json'),
        })
      },
    },
  ],
  build: {
    target: 'es2020',
    emptyOutDir: false,
    outDir: 'dist/locales',
    rollupOptions: {
      input: resolvePath('src/locales/index.ts'),
      // output.preserveModules 要求不能是 false（Vite 默认会给 false）
      preserveEntrySignatures: 'strict',
      external: (id) => isExternalPackage(id),
      output: {
        format: 'es',
        preserveModules: true,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
  },
})
