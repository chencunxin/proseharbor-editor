#!/usr/bin/env node
/**
 * 自动生成 content.scss
 *
 * 从各组件样式文件提取内容样式，生成独立的 content.scss
 * 这样只需维护组件样式，content.scss 自动生成
 *
 * 使用：
 *   node scripts/generate-content-scss.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const stylesDir = path.resolve(__dirname, '..', 'src', 'styles')

// 内容样式源文件（按顺序合并）
const contentSourceFiles = [
  { file: 'heading.scss', desc: '标题' },
  { file: 'list.scss', desc: '列表' },
  { file: 'blockquote.scss', desc: '引用块' },
  { file: 'code.scss', desc: '行内代码' },
  { file: 'code-block.scss', desc: '代码块' },
  { file: 'link.scss', desc: '链接' },
  { file: 'divider.scss', desc: '分割线' },
  { file: 'table.scss', desc: '表格' },
  { file: 'image.scss', desc: '图片' },
  { file: 'indent.scss', desc: '缩进' },
]

// 文件头
const header = `/**
 * proseharbor-editor content styles
 * 自动生成文件 - 由 scripts/generate-content-scss.js 生成
 * 生成时间: ${new Date().toISOString()}
 *
 * 用于在编辑器之外展示富文本内容的独立样式文件。
 * 在展示容器上添加 class="proseharbor-editor-content" 即可使用。
 *
 * 使用方式：
 *   import '@chencunxin/proseharbor-editor-next-vue3/content.css'
 *
 *   <div class="proseharbor-editor-content" v-html="content" />
 */

@use "config" as *;
@use "vars";

// 内容展示容器的通用选择器
// 同时支持编辑器内部（.proseharbor-editor.ProseMirror）和独立展示（.proseharbor-editor-content）
$content-selectors: ".#{$prefix}.ProseMirror, .#{$prefix}-content";

// ===== 基础排版 =====
#{$content-selectors} {
  font-size: var(--#{$prefix}-font-size);
  line-height: var(--#{$prefix}-line-height);
  color: var(--#{$prefix}-text-color);
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;

  p {
    line-height: inherit;
    margin: 0;
    margin-top: var(--#{$prefix}-margin);

    &:first-child {
      margin-top: 0;
    }
  }
`

// 文件尾
const footer = `\n}\n`

/**
 * 从文件中提取 ProseMirror 样式块的内容
 * @param {string} filePath - 文件路径
 * @returns {string|null} - 提取的内容
 */
function extractContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  // 找到 .#{$prefix}.ProseMirror { 开始的位置
  // 使用 String.raw 避免模板字符串解析问题
  const marker = String.raw`.#{$prefix}.ProseMirror {`
  const startIdx = content.indexOf(marker)
  if (startIdx === -1) return null

  // 找到 .ProseMirror 后面的第一个 {（跳过 #{} 里的 }）
  let braceStart = content.indexOf('{', startIdx + marker.length - 1)
  if (braceStart === -1) return null

  // 找匹配的 }
  let braceCount = 1
  let pos = braceStart + 1

  while (pos < content.length && braceCount > 0) {
    if (content[pos] === '{') braceCount++
    else if (content[pos] === '}') braceCount--
    pos++
  }

  // 提取内部内容
  let inner = content.substring(braceStart + 1, pos - 1)

  // 清理 @use, @import
  inner = inner.replace(/@use\s+["'][^"']+["'][^;]*;/g, '')
  inner = inner.replace(/@import\s+["'][^"']+["'][^;]*;/g, '')

  // 清理开头和结尾的空行
  inner = inner.replace(/^\s*\n/, '').replace(/\n\s*$/, '')

  return inner
}

/**
 * 主函数
 */
function generate() {
  console.log('🔄 生成 content.scss...\n')

  let combinedContent = ''
  let processedCount = 0
  let skippedFiles = []

  for (const { file, desc } of contentSourceFiles) {
    const filePath = path.join(stylesDir, file)

    if (!fs.existsSync(filePath)) {
      skippedFiles.push(`${file} (不存在)`)
      continue
    }

    const extracted = extractContent(filePath)

    if (extracted && extracted.trim()) {
      combinedContent += `\n  // ===== ${desc} =====\n`
      // 给每行加 2 空格缩进
      const indented = extracted
        .split('\n')
        .map((line) => '  ' + line)
        .join('\n')
      combinedContent += indented
      combinedContent += '\n'
      processedCount++
      console.log(`  ✅ ${desc} (${file})`)
    } else {
      skippedFiles.push(`${file} (无内容)`)
    }
  }

  // 组合最终内容
  const finalContent = header + combinedContent + footer

  // 写入文件
  const outputPath = path.join(stylesDir, 'content.scss')
  fs.writeFileSync(outputPath, finalContent, 'utf-8')

  console.log(`\n✅ 生成完成: ${outputPath}`)
  console.log(`   成功处理: ${processedCount} 个文件`)

  if (skippedFiles.length > 0) {
    console.log(`   跳过: ${skippedFiles.length} 个文件`)
    skippedFiles.forEach((f) => console.log(`      - ${f}`))
  }

  console.log(`\n💡 提示:`)
  console.log(`   - 修改组件样式后重新运行此脚本即可更新 content.scss`)
  console.log(`   - 复杂样式可能需要手动微调`)
}

// 运行
generate()
