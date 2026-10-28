/**
 * 内容样式配置 - 用于 sanitizeHtml 内联样式
 * 这些值应与 packages/vue3/src/styles/content.scss 保持一致
 */

export const contentStyles = {
  // 段落
  p: {
    margin: '0.5em 0',
    lineHeight: '1.75',
  },

  // 标题
  h1: {
    fontSize: '1.875rem',
    lineHeight: '2.25rem',
    marginTop: '2.5rem',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  h2: {
    fontSize: '1.5rem',
    lineHeight: '2rem',
    marginTop: '2.5rem',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  h3: {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    marginTop: '2.5rem',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  h4: {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    marginTop: '2rem',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  h5: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    marginTop: '2rem',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  h6: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    marginTop: '2rem',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },

  // 链接
  a: {
    color: '#3b82f6',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },

  // 分割线
  hr: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '0.5em 0',
  },

  // 引用块
  blockquote: {
    paddingLeft: '0.6rem',
    borderLeft: '0.3rem solid #e5e7eb',
    margin: '0.5em 0',
    color: '#6b7280',
  },

  // 行内代码
  code: {
    padding: '0.2em 0.4em',
    fontSize: '90%',
    borderRadius: '0.25rem',
    backgroundColor: 'rgba(229, 231, 235, 0.55)',
    color: '#ef4444',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  // 代码块
  pre: {
    whiteSpace: 'pre-wrap',
    backgroundColor: 'rgba(229, 231, 235, 0.2)',
    borderRadius: '0.4rem',
    border: '1px solid rgba(229, 231, 235, 0.5)',
    fontWeight: '500',
    fontFamily: '"JetBrainsMono", monospace',
    padding: '1.25rem',
    margin: '0.5em 0',
  },

  // 列表
  ul: {
    listStyleType: 'disc',
    listStylePosition: 'outside',
    paddingLeft: '1.4em',
    margin: '0.5em 0',
  },
  ol: {
    listStyleType: 'decimal',
    listStylePosition: 'outside',
    paddingLeft: '1.4em',
    margin: '0.5em 0',
  },
  li: {
    lineHeight: '1.75',
    margin: '0.25em 0',
  },

  // 图片
  img: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '0.25rem',
    margin: '0.5em 0',
  },

  // 表格
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    margin: '0.5em 0',
  },
  th: {
    border: '1px solid #e5e7eb',
    padding: '3px 5px',
    backgroundColor: 'rgba(229, 231, 235, 0.4)',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #e5e7eb',
    padding: '3px 5px',
  },
}

/**
 * 将样式对象转换为内联 style 字符串
 * @param {Object} styles
 * @returns {string}
 */
export function stylesToString(styles) {
  if (!styles) return ''
  return Object.entries(styles)
    .map(([key, value]) => {
      // 将 camelCase 转换为 kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${value}`
    })
    .join('; ')
}
