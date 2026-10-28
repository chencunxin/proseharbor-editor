/** 允许写入文档的链接协议白名单（其余协议一律视为不安全） */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/** 以 / ./ ../ # ? 开头的相对地址 */
const IS_PATH_LIKE = /^([./?#]|\.{1,2}\/)/

const check = (parsed: URL): string => (ALLOWED_PROTOCOLS.has(parsed.protocol) ? parsed.href : '')

/**
 * 校验链接地址，阻断 javascript: / data: 等可执行协议，避免 XSS
 *
 * 解析顺序：
 * 1. 带协议的绝对地址 → 直接走协议白名单（不在白名单即拦截，不再尝试补全）
 * 2. 相对地址（/foo、./foo、?x=1）→ 基于 base（默认 location.href）解析
 * 3. 缺少协议的域名（example.com）→ 补全 https:// 后再次校验
 *
 * @returns 安全则返回规范化后的 URL，否则返回空字符串
 */
export const sanitizeUrl = (url?: string, base?: string): string => {
  const value = url?.trim()

  if (!value) return ''

  const baseHref = base ?? (typeof location !== 'undefined' ? location.href : undefined)

  try {
    // 1. 绝对地址（必须带协议，否则 new URL 会抛错）
    const parsed = new URL(value)

    // 协议里带点的（如 example.com:8080/p）多半是漏写 scheme 的域名，交给下面的补全逻辑
    if (!parsed.protocol.includes('.')) {
      return check(parsed)
    }
  } catch {
    // 继续往下尝试其它形式
  }

  // 2. 相对地址：基于当前页面地址解析
  if (baseHref && IS_PATH_LIKE.test(value)) {
    try {
      return check(new URL(value, baseHref))
    } catch {
      return ''
    }
  }

  // 3. 缺少协议的域名，补全 https:// 后再校验
  try {
    return check(new URL(`https://${value}`))
  } catch {
    return ''
  }
}

/** 判断链接是否可以直接在页面上展示 / 打开 */
export const isSafeUrl = (url?: string, base?: string): boolean => Boolean(sanitizeUrl(url, base))
