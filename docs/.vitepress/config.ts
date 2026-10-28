import { defineConfig } from 'vitepress'
import type { HeadConfig, UserConfig } from 'vitepress'
import path from 'path'
import { fileURLToPath } from 'url'
import { containerPreview, componentPreview } from '@vitepress-demo-preview/plugin'

import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

import { getMeta } from './meta'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resolve = (dir: string) => (dir ? path.resolve(__dirname, '../', dir) : __dirname)

// vitepress 内置的是 vite 5，仓库根目录装的是 vite 8，两边的 Plugin 类型不互通，
// 这里取 vitepress 期望的类型做一次桥接（运行时不受影响）
type VitePlugins = NonNullable<UserConfig['vite']>['plugins']

type Lang = 'en' | 'zh'

/** 各语言的文案表，用于生成导航与侧边栏 */
const LABELS = {
  en: {
    guide: 'Guide',
    gettingStarted: 'Getting Started',
    introduction: 'Introduction',
    quickStart: 'Quick Start',
    examples: 'Examples',
    i18n: 'Internationalization',
    theming: 'Theming',
    playground: 'Playground',
    vue3: 'Used in Vue3',
    core: 'Core',
    instance: 'Instance',
    events: 'Events',
    commands: 'Commands',
    utils: 'Utils',
    extensions: 'Extensions',
    overview: 'Overview',
    nodes: 'Node Extensions',
    marks: 'Mark Extensions',
    features: 'Feature Extensions',
    custom: 'Custom Extensions',
    kit: 'Kit',
    basicKit: 'Basic Kit',
    richTextKit: 'Rich Text Kit',
    notionKit: 'Notion Kit',
    view: 'View',
    editorComponent: 'Editor Component',
    components: 'Components',
    about: 'About',
    faq: 'FAQ',
    changelog: 'Changelog',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    editLink: 'Edit this page on GitHub',
    footerMessage: 'Released under the MIT License.',
  },
  zh: {
    guide: '指南',
    gettingStarted: '开始',
    introduction: '介绍',
    quickStart: '快速开始',
    examples: '示例',
    i18n: '国际化',
    theming: '主题',
    playground: '演示',
    vue3: 'Vue3 中使用',
    core: '核心',
    instance: '实例',
    events: '事件',
    commands: '命令',
    utils: '工具函数',
    extensions: '扩展',
    overview: '总览',
    nodes: '节点扩展',
    marks: '标记扩展',
    features: '功能扩展',
    custom: '自定义扩展',
    kit: '套件',
    basicKit: '基础套件',
    richTextKit: '富文本套件',
    notionKit: 'Notion 套件',
    view: '视图',
    editorComponent: '编辑器组件',
    components: '组件',
    about: '关于',
    faq: 'FAQ',
    changelog: '变更日志',
    aboutUs: '关于我们',
    contactUs: '联系我们',
    editLink: '在 GitHub 上编辑此页',
    footerMessage: '根据 MIT 许可发布。',
  },
} satisfies Record<Lang, Record<string, string>>

/** 页面路径：简体中文站点整体挂在 /zh 下 */
const PATHS = {
  en: {
    introduction: '/guide/introduction',
    quickStart: '/guide/quick-start',
    examples: '/guide/examples',
    i18n: '/guide/i18n',
    theming: '/guide/theming',

    instance: '/core/instance',
    events: '/core/events',
    commands: '/core/commands',
    utils: '/core/utils',

    extensionsOverview: '/extensions/overview',
    extensionsNodes: '/extensions/nodes',
    extensionsMarks: '/extensions/marks',
    extensionsFeatures: '/extensions/features',
    extensionsCustom: '/extensions/custom',

    basicKit: '/kit/basic',
    richTextKit: '/kit/richtext',
    notionKit: '/kit/notion',

    vue3QuickStart: '/vue3/quick-start',
    vue3Editor: '/vue3/editor',
    vue3Components: '/vue3/components',

    faq: '/about/faq',
    changelog: '/about/changelog',
    aboutUs: '/about/about-us',
    contactUs: '/about/contact-us',
  },
  zh: {
    introduction: '/zh/guide/introduction',
    quickStart: '/zh/guide/quick-start',
    examples: '/zh/guide/examples',
    i18n: '/zh/guide/i18n',
    theming: '/zh/guide/theming',

    instance: '/zh/core/instance',
    events: '/zh/core/events',
    commands: '/zh/core/commands',
    utils: '/zh/core/utils',

    extensionsOverview: '/zh/extensions/overview',
    extensionsNodes: '/zh/extensions/nodes',
    extensionsMarks: '/zh/extensions/marks',
    extensionsFeatures: '/zh/extensions/features',
    extensionsCustom: '/zh/extensions/custom',

    basicKit: '/zh/kit/basic',
    richTextKit: '/zh/kit/richtext',
    notionKit: '/zh/kit/notion',

    vue3QuickStart: '/zh/vue3/quick-start',
    vue3Editor: '/zh/vue3/editor',
    vue3Components: '/zh/vue3/components',

    faq: '/zh/about/faq',
    changelog: '/zh/about/changelog',
    aboutUs: '/zh/about/about-us',
    contactUs: '/zh/about/contact-us',
  },
} satisfies Record<Lang, Record<string, string>>

/** 两种语言共用的 <head> 标签 */
function buildHead(lang: Lang, description: string): HeadConfig[] {
  return [
    ['meta', { name: 'referrer', content: 'no-referrer-when-downgrade' }],
    ['meta', { name: 'keywords', content: getMeta('keywords') }],
    ['meta', { name: 'author', content: getMeta('author') }],

    ['link', { rel: 'shortcut icon', href: getMeta('ico') }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: getMeta('ico') }],

    // webfont
    ['link', { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' }],
    [
      'link',
      {
        rel: 'preconnect',
        crossorigin: 'anonymous',
        href: 'https://fonts.googleapis.com',
      },
    ],
    [
      'link',
      {
        rel: 'preconnect',
        crossorigin: 'anonymous',
        href: 'https://fonts.gstatic.com',
      },
    ],

    // og
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: getMeta('site') }],
    [
      'meta',
      {
        property: 'og:locale',
        content: lang === 'zh' ? 'zh_CN' : 'en',
      },
    ],
  ]
}

function buildNav(lang: Lang) {
  const label = LABELS[lang]
  const link = PATHS[lang]

  return [
    {
      text: label.guide,
      items: [
        {
          text: label.gettingStarted,
          items: [
            { text: label.introduction, link: link.introduction },
            { text: label.quickStart, link: link.quickStart },
            { text: label.examples, link: link.examples },
          ],
        },
        {
          text: label.i18n,
          link: link.i18n,
        },
        {
          text: label.theming,
          link: link.theming,
        },
        {
          text: label.vue3,
          link: link.vue3QuickStart,
        },
      ],
    },
    { text: label.playground, link: 'https://proseharbor.acnrs.com' },
    {
      text: label.about,
      items: [
        { text: label.faq, link: link.faq },
        { text: label.changelog, link: link.changelog },
        { text: label.aboutUs, link: link.aboutUs },
        { text: label.contactUs, link: link.contactUs },
      ],
    },
  ]
}

function buildSidebar(lang: Lang) {
  const label = LABELS[lang]
  const link = PATHS[lang]

  return [
    {
      text: label.gettingStarted,
      items: [
        { text: label.introduction, link: link.introduction },
        { text: label.quickStart, link: link.quickStart },
        { text: label.examples, link: link.examples },
        { text: label.i18n, link: link.i18n },
        { text: label.theming, link: link.theming },
      ],
    },
    {
      text: label.core,
      items: [
        { text: label.instance, link: link.instance },
        { text: label.events, link: link.events },
        { text: label.commands, link: link.commands },
        { text: label.utils, link: link.utils },
      ],
    },
    {
      text: label.extensions,
      items: [
        { text: label.overview, link: link.extensionsOverview },
        { text: label.nodes, link: link.extensionsNodes },
        { text: label.marks, link: link.extensionsMarks },
        { text: label.features, link: link.extensionsFeatures },
        { text: label.custom, link: link.extensionsCustom },
      ],
    },
    {
      text: label.kit,
      items: [
        { text: label.basicKit, link: link.basicKit },
        { text: label.richTextKit, link: link.richTextKit },
        { text: label.notionKit, link: link.notionKit },
      ],
    },
    {
      text: label.view,
      items: [
        {
          text: 'Vue3',
          collapsed: true,
          items: [
            { text: label.quickStart, link: link.vue3QuickStart },
            { text: label.editorComponent, link: link.vue3Editor },
            { text: label.components, link: link.vue3Components },
          ],
        },
      ],
    },
    {
      text: label.about,
      items: [
        { text: label.faq, link: link.faq },
        { text: label.changelog, link: link.changelog },
        { text: label.aboutUs, link: link.aboutUs },
        { text: label.contactUs, link: link.contactUs },
      ],
    },
  ]
}

export default defineConfig({
  sitemap: {
    hostname: getMeta('site'),
  },
  lastUpdated: true,
  ignoreDeadLinks: true,

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: getMeta('en.title'),
      description: getMeta('en.description'),
      head: buildHead('en', getMeta('en.description')),
      themeConfig: {
        nav: buildNav('en'),
        sidebar: buildSidebar('en'),

        socialLinks: [{ icon: 'github', link: getMeta('github') }],

        outline: 'deep',

        editLink: {
          pattern: getMeta('github') + '/edit/main/docs/:path',
          text: LABELS.en.editLink,
        },

        footer: {
          message: LABELS.en.footerMessage,
          copyright: 'Copyright © 2024-present proseharbor-editor contributors',
        },

        externalLinkIcon: true,

        search: {
          provider: 'local',
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: getMeta('zh.title'),
      description: getMeta('zh.description'),
      head: buildHead('zh', getMeta('zh.description')),
      themeConfig: {
        nav: buildNav('zh'),
        sidebar: buildSidebar('zh'),

        outlineTitle: '目录...',
        returnToTopLabel: '返回顶部',
        darkModeSwitchLabel: '模式',
        sidebarMenuLabel: '归档',
        lastUpdatedText: '最后更新时间',
        docFooter: {
          prev: '上一页',
          next: '下一页',
        },

        socialLinks: [{ icon: 'github', link: getMeta('github') }],

        outline: 'deep',

        editLink: {
          pattern: getMeta('github') + '/edit/main/docs/:path',
          text: LABELS.zh.editLink,
        },

        footer: {
          message: LABELS.zh.footerMessage,
          copyright: 'Copyright © 2024-present proseharbor-editor contributors',
        },

        externalLinkIcon: true,

        search: {
          provider: 'local',
        },
      },
    },
  },

  markdown: {
    config(md) {
      // markdown-it 的类型声明有两份（markdown-it 自带 / @types/markdown-it），
      // 签名不兼容，这里做一次类型桥接，运行时行为不变
      type MarkdownItPlugin = Parameters<typeof md.use>[0]

      md.use(containerPreview as unknown as MarkdownItPlugin)
      md.use(componentPreview as unknown as MarkdownItPlugin)
    },
  },

  vite: {
    plugins: [
      Components({
        dirs: [resolve('.vitepress/theme/components')],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          IconsResolver({
            prefix: 'icon',
            customCollections: ['custom'],
          }),
        ],
      }),
      Icons({
        compiler: 'vue3',
        customCollections: {
          custom: FileSystemIconLoader('public/svg/custom', (svg) =>
            svg.replace(/^<svg /, '<svg fill="currentColor" '),
          ),
        },
        autoInstall: true,
      }),
      UnoCSS({
        // more config: unocss.config.js
      }),
    ] as unknown as VitePlugins,
  },
})
