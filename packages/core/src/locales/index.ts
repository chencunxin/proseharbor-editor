import Locales from 'i18next'
import zh from './zh.json'
import en from './en.json'
import de from './de.json'

const NS = 'translation'

Locales.init({
  lng: 'zh',
  // debug: true,
  resources: {},
})
addLocale('zh', zh)
addLocale('en', en)
addLocale('de', de)

export function addLocale(lng: string, resources: Record<string, unknown>): void {
  Locales.addResourceBundle(lng, NS, resources, true, true)
}

export function changeLocale(lng: string): void {
  Locales.changeLanguage(lng)
}

export function getLocale(lng: string): Record<string, unknown> {
  return Locales.getResourceBundle(lng, NS) as Record<string, unknown>
}

export function t(key: string, options: Record<string, unknown> = {}): string {
  const result = Locales.t(key, options)
  if (result === key) {
    return key.split('.').pop() ?? key
  }
  return result ?? key
}

export const te = Locales.exists.bind(Locales)

export default Locales
