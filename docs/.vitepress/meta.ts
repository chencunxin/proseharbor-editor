import { version, keywords, author } from '../package.json'

const BASE = {
  site: 'https://proseharbor-doc.acnrs.com',
  github: 'https://github.com/chencunxin/proseharbor-editor',
  ico: '/img/site/logo.png',
  logo: '/img/site/logo.png',
  version,
  author,
  // head 里的 meta content 必须是字符串，package.json 里是数组
  keywords: keywords.join(', '),
}

const meta = {
  ...BASE,
  zh: {
    title: 'Proseharbor编辑器',
    description:
      '开源 Web 编辑器，支持富文本、块、markdown 编辑，高效且开箱即用，基于 ProseMirror 和 TipTap。',
  },
  en: {
    title: 'Proseharbor Editor',
    description:
      'Open source web editor, supports rich text, block, markdown editing, efficient and out-of-the-box, based on ProseMirror and TipTap.',
  },
}

/**
 * 通过路径获取对象值
 * @param {string} path - 点号分隔的路径，如 'zh.description' 或 'en.site.url'
 * @param {object} obj - 要查询的对象，默认为 meta
 * @returns {any} 找到的值或 undefined
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 按路径取值，值类型由调用方决定
type AnyRecord = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 同上
export function getMeta(path: string, obj: AnyRecord = meta): any {
  if (!path) return obj
  const keys = path.split('.')

  return keys.reduce((value: AnyRecord, key: string) => {
    return value && typeof value === 'object' ? value[key] : undefined
  }, obj)
}
