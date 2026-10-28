/**
 * Node.js 版本的 HTML 清洗工具
 * 使用 cheerio 替代 DOMParser，适合服务端使用
 *
 * 安装依赖：npm install cheerio
 */

import * as cheerio from 'cheerio'

const EDITOR_CLASS_PREFIX = 'proseharbor-editor__'

/**
 * 清洗 HTML，返回干净的展示用 HTML
 * @param html - 编辑器输出的原始 HTML
 * @returns 清洗后的 HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return html
  }

  const $ = cheerio.load(html, {
    xmlMode: false,
  })

  // 处理所有元素
  $('*').each((_, element) => {
    const $el = $(element)
    const node = element as unknown as { tagName?: string; attribs?: Record<string, string> }
    const tagName = node.tagName?.toLowerCase()

    // 获取所有属性
    const attributes = Object.keys(node.attribs || {})

    for (const attr of attributes) {
      // 删除 data-* 属性
      if (attr.startsWith('data-')) {
        // 特殊处理 data-indent：转换为 style
        if (attr === 'data-indent' && tagName === 'p') {
          const indent = parseInt($el.attr(attr) ?? '', 10)
          if (indent > 0) {
            const newPadding = `${indent * 2}em`
            $el.css('padding-left', newPadding)
          }
        }
        $el.removeAttr(attr)
        continue
      }

      // 处理 class
      if (attr === 'class') {
        const newClass = cleanClass($el.attr('class') ?? '')
        if (newClass) {
          $el.attr('class', newClass)
        } else {
          $el.removeAttr('class')
        }
        continue
      }

      // 删除 id
      if (attr === 'id') {
        $el.removeAttr('id')
        continue
      }
    }
  })

  // 返回 body 内的 HTML，或整个 HTML
  return $('body').html() || $.html()
}

/**
 * 清洗 class
 */
function cleanClass(classValue: string): string {
  if (!classValue) return ''

  const classes = classValue.split(/\s+/).filter(Boolean)
  const cleaned = classes.filter((cls) => !cls.startsWith(EDITOR_CLASS_PREFIX))

  return cleaned.join(' ')
}

export default sanitizeHtml
