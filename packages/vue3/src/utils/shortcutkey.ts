import { isMacOS } from '@proseharbor-editor/core'

export function convertShortcutKeys(str: string): string {
  if (!str) return ''
  const isMac = isMacOS()

  return str
    .toUpperCase()
    .replace(/MOD/g, isMac ? '⌘' : 'Ctrl')
    .replace(/SHIFT/g, '⇧')
    .replace(/ALT|OPTION/g, '⌥')
    .replace(/ENTER/g, '↵')
    .replace(/BACKSPACE/g, '⌫')
}
