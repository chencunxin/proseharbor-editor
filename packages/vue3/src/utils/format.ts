/**
 * 将驼峰命名转换为短横线命名
 * @param {string} str - 要转换的字符串
 * @returns {string} - 转换后的字符串
 * @example
 * convertToKebabCase('addColumnAfter') // -> 'add-column-after'
 * convertToKebabCase('AddColumnBefore') // -> 'add-column-before'
 * convertToKebabCase('Bold') // -> 'bold'
 */
export const convertToKebabCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
    .toLowerCase()
}

// 缩进单位
const INDENT_UNIT = '  '

// 块级标签：前后需要换行并缩进
const BLOCK_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'caption',
  'dd',
  'details',
  'dialog',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'legend',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'summary',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
])

// 空元素标签：没有闭合标签
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

// 需要保留内部空白的标签
const PRESERVE_SPACE_TAGS = new Set(['pre', 'textarea'])

const NODE_TEXT = 3
const NODE_ELEMENT = 1

// 以拼接方式构造实体，避免被工具链预先解码
const ENTITY_AMP = '&' + 'amp;'
const ENTITY_LT = '&' + 'lt;'
const ENTITY_GT = '&' + 'gt;'
const ENTITY_QUOT = '&' + 'quot;'
const ENTITY_NBSP = '&' + 'nbsp;'

const ENTITY_MAP: Record<string, string> = {
  '&': ENTITY_AMP,
  '<': ENTITY_LT,
  '>': ENTITY_GT,
  '\u00a0': ENTITY_NBSP,
}

// 文本节点转义，保证格式化后的字符串再次解析时内容不丢失
const escapeText = (text: string | null | undefined): string =>
  String(text || '').replace(/[&<>\u00a0]/g, (char) => ENTITY_MAP[char])

const escapeAttribute = (value: unknown): string =>
  String(value || '')
    .replace(/&/g, ENTITY_AMP)
    .replace(/"/g, ENTITY_QUOT)

const getTagName = (node: Node): string => String(node.nodeName || '').toLowerCase()

const serializeAttributes = (node: Element): string => {
  const attributes = node.attributes ? (Array.from(node.attributes) as Attr[]) : []
  return attributes.reduce((result: string, attr: Attr) => {
    const value = attr.value ?? ''
    const serialized = value === '' ? ` ${attr.name}` : ` ${attr.name}="${escapeAttribute(value)}"`
    return result + serialized
  }, '')
}

// 仅由制表/换行/空格组成的文本节点（不换行空格 NBSP 属于内容，不能丢弃）
const isIgnorableText = (node: Node): boolean =>
  node.nodeType === NODE_TEXT && /^[\t\n\r\f ]*$/.test(String(node.nodeValue || ''))

const serializeNode = (node: Node, level: number, preserveSpace: boolean): string => {
  if (node.nodeType === NODE_TEXT) {
    return escapeText(node.nodeValue)
  }

  // 注释等非元素节点直接丢弃
  if (node.nodeType !== NODE_ELEMENT) return ''

  const tag = getTagName(node)
  const attributes = serializeAttributes(node as Element)

  if (VOID_TAGS.has(tag)) return `<${tag}${attributes} />`

  const children = serializeChildren(node, level + 1, preserveSpace || PRESERVE_SPACE_TAGS.has(tag))

  return `<${tag}${attributes}>${children}</${tag}>`
}

const serializeChildren = (node: Node, level: number, preserveSpace: boolean): string => {
  const childNodes = Array.from(node.childNodes || []) as Node[]

  if (!childNodes.length) return ''

  const hasBlockChild = childNodes.some(
    (child) => child.nodeType === NODE_ELEMENT && BLOCK_TAGS.has(getTagName(child)),
  )

  // 行内内容原样拼接，保留其中的空格文本节点，避免文本被粘连
  if (!hasBlockChild) {
    return childNodes.map((child) => serializeNode(child, level, preserveSpace)).join('')
  }

  // 块级布局下，块之间仅用于缩进的空白文本节点无意义，可丢弃
  const nodes = preserveSpace ? childNodes : childNodes.filter((child) => !isIgnorableText(child))

  if (!nodes.length) return ''

  const indent = INDENT_UNIT.repeat(level)
  // 顶层（level 为 0）不产生闭合缩进
  const closeIndent = level > 0 ? INDENT_UNIT.repeat(level - 1) : ''

  return (
    '\n' +
    nodes.map((child) => indent + serializeNode(child, level, preserveSpace)).join('\n') +
    '\n' +
    closeIndent
  )
}

/**
 * 格式化 HTML 字符串（用于代码预览）
 * 块级标签换行并缩进，行内标签与文本保持原样，
 * 空白敏感标签（pre / textarea）内部内容不做处理
 * @param {string} html - 需要格式化的 HTML 字符串
 * @returns {string} - 格式化后的 HTML 字符串
 * @example
 * formatHTML('<p>hi</p><ul><li><p>a</p></li></ul>')
 * // -> '<p>hi</p>\n<ul>\n  <li>\n    <p>a</p>\n  </li>\n</ul>'
 */
export const formatHTML = (html: string): string => {
  if (!html || typeof html !== 'string') return ''
  // 非浏览器环境（SSR）下不做处理，直接返回原始字符串
  if (typeof document === 'undefined') return html

  const container = document.createElement('div')
  container.innerHTML = html

  return serializeChildren(container, 0, false).trim()
}
