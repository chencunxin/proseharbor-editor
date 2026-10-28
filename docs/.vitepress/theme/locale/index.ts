import en from './en.js'
import zh from './zh.js'

const hash = {
  en,
  zh,
}

type LocaleKey = keyof typeof hash
type Messages = Record<string, string>

/** 取语言包，locale 形如 zh / zh-CN / en-US，统一按主语言匹配 */
const getMessages = (locale: string): Messages | undefined =>
  hash[locale.split('-')[0] as LocaleKey]

export function t(locale: string, key: string, params: Record<string, string> = {}) {
  const messages = getMessages(locale)
  if (!messages) return ''

  let text = messages[key] ?? ''
  Object.keys(params).forEach((k) => {
    const regex = new RegExp(`{${k}}`, 'g')
    text = text.replace(regex, params[k])
  })
  return text
}

export function routerPath(locale: string, path: string) {
  return (locale.split('-')[0] == 'zh' ? '/zh' : '') + path
}
