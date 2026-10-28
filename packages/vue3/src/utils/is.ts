interface NavigatorUAData {
  platform?: string
  brands?: { brand: string; version: string }[]
  mobile?: boolean
}

/** 扩展 Navigator，支持 userAgentData（部分浏览器提供） */
declare global {
  interface Navigator {
    userAgentData?: NavigatorUAData
  }
}

export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false

  if (navigator.userAgentData?.platform) {
    return navigator.userAgentData.platform === 'macOS'
  }

  return /macintosh|mac os x/i.test(navigator.userAgent)
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !isArray(value)
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 判断是否为空（null、undefined、空字符串、空数组、空对象）
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (isString(value)) return value.trim().length === 0
  if (isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}
