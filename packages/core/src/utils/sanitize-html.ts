/**
 * 将编辑器输出的 HTML 清洗为干净的展示用 HTML
 * - 去掉 proseharbor-editor__* class
 * - 去掉 data-id, data-indent 等编辑器内部属性
 * - 将缩进转换为 style="padding-left"
 * - 内联关键样式（用于小程序等不支持外部 CSS 的环境）
 * - 保留所有语义标签
 *
 * 使用场景：小程序、H5、安卓、其他 PC 项目展示
 */

import { contentStyles, stylesToString } from './inline-styles'

const EDITOR_CLASS_PREFIX = 'proseharbor-editor__'

/**
 * 清洗 HTML，返回干净的展示用 HTML
 * @param {string} html - 编辑器输出的原始 HTML
 * @param {Object} options - 配置选项
 * @param {boolean} options.inlineStyles - 是否内联样式（默认 true，小程序建议开启）
 * @returns {string} - 清洗后的 HTML
 */
/** 清洗配置 */
export interface SanitizeOptions {
  /** 是否内联样式（默认 true，小程序建议开启） */
  inlineStyles?: boolean
}

export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  const { inlineStyles = true } = options

  if (!html || typeof html !== 'string') {
    return html
  }

  // 使用 DOMParser 解析 HTML（浏览器/Node.js 环境都可用）
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // 递归处理所有节点
  cleanNode(doc.body, { inlineStyles })

  // 返回 body 内的 HTML
  return doc.body.innerHTML
}

/**
 * 递归清洗节点
 * @param {Element} node
 * @param {Object} options
 */
function cleanNode(node: HTMLElement, options: SanitizeOptions): void {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) {
    return
  }

  // 处理当前节点的属性
  cleanAttributes(node, options)

  // 递归处理子节点（从后往前遍历，避免删除节点影响索引）
  const children = Array.from(node.children) as HTMLElement[]
  for (let i = children.length - 1; i >= 0; i--) {
    cleanNode(children[i], options)
  }
}

/**
 * 清洗节点的属性
 * @param {Element} element
 * @param {Object} options
 */
function cleanAttributes(element: HTMLElement, options: SanitizeOptions): void {
  const { inlineStyles } = options
  const tagName = element.tagName.toLowerCase()
  const attributesToRemove: string[] = []

  // 收集需要删除的属性
  for (const attr of element.attributes) {
    const name = attr.name
    const value = attr.value

    // 删除 data-id 等编辑器内部属性
    if (name.startsWith('data-')) {
      // 特殊处理 data-indent：转换为 style
      if (name === 'data-indent' && tagName === 'p') {
        const indent = parseInt(value, 10)
        if (indent > 0) {
          const newPadding = `${indent * 2}em`
          element.style.paddingLeft = newPadding
        }
      }
      attributesToRemove.push(name)
      continue
    }

    // 处理 class 属性
    if (name === 'class') {
      const newClass = cleanClass(value)
      if (newClass) {
        element.setAttribute('class', newClass)
      } else {
        attributesToRemove.push(name)
      }
      continue
    }

    // 删除 id 属性（编辑器内部使用）
    if (name === 'id') {
      attributesToRemove.push(name)
      continue
    }
  }

  // 删除收集的属性
  for (const attrName of attributesToRemove) {
    element.removeAttribute(attrName)
  }

  // 内联关键样式
  if (inlineStyles && contentStyles[tagName]) {
    const existingStyle = element.getAttribute('style') || ''
    const newStyle = stylesToString(contentStyles[tagName])

    // 合并样式，保留原有样式
    if (existingStyle) {
      element.setAttribute('style', `${newStyle}; ${existingStyle}`)
    } else {
      element.setAttribute('style', newStyle)
    }
  }
}

/**
 * 清洗 class，去掉 proseharbor-editor__* 前缀
 * @param {string} classValue
 * @returns {string} - 清洗后的 class，如果为空则返回空字符串
 */
function cleanClass(classValue) {
  if (!classValue) return ''

  const classes = classValue.split(/\s+/).filter(Boolean)
  const cleaned = classes.filter((cls) => !cls.startsWith(EDITOR_CLASS_PREFIX))

  return cleaned.join(' ')
}

/**
 * 快捷方法：直接获取清洗后的 HTML
 * 兼容 editor.getHTML() 的用法
 *
 * @example
 * const html = editor.getHTML();
 * const cleanHtml = sanitizeHtml(html);
 * await saveToBackend(cleanHtml);
 *
 * @example
 * // 小程序场景：内联所有样式
 * const cleanHtml = sanitizeHtml(html, { inlineStyles: true });
 *
 * @example
 * // H5/PC 场景：不内联样式，依赖 content.css
 * const cleanHtml = sanitizeHtml(html, { inlineStyles: false });
 */
export default sanitizeHtml
