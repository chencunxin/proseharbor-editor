/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Editor } from '@tiptap/core'

/**
 * 本项目在 Tiptap 扩展上附加了一批自定义能力：
 *  - 扩展 commands 上的自定义命令（setBackground / updateToc / ...）
 *  - 扩展 options 上的菜单元信息（见 ExtensionMeta）
 *
 * Tiptap 的类型是按扩展逐个声明的，这里统一做一次模块增强，
 * 避免每个扩展都写一遍 declare module。
 */
declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Commands<ReturnType> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

/** 菜单命令执行上下文，除 editor 外各扩展可自带参数（href / target / ...） */
export interface ExtensionCommandContext {
  editor: Editor
  range?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

/** 扩展菜单元信息：供 Vue 层生成工具栏 / 气泡菜单 / 斜杠菜单使用 */
export interface ExtensionMeta {
  /** 扩展显示名 */
  name?: string
  /** 菜单描述 / 搜索关键字 */
  desc?: string
  /** 菜单图标 */
  icon?: string
  /** 分组 */
  group?: string
  /** 是否出现在斜杠菜单 */
  slash?: boolean
  /** 点击菜单时执行的命令 */
  command?: (context: ExtensionCommandContext) => boolean | void
  /** 菜单项是否处于激活态 */
  isActive?: (context: { editor: Editor }) => boolean
  /** 菜单项是否禁用 */
  isDisabled?: (context: { editor: Editor }) => boolean
  /** 快捷键，如 Mod-B */
  shortcutkeys?: string | string[]
  /** 排序权重 */
  sort?: number
}

declare module '@tiptap/extension-bold' {
  interface BoldOptions extends ExtensionMeta {}
}

declare module '@tiptap/extension-italic' {
  interface ItalicOptions extends ExtensionMeta {}
}

declare module '@tiptap/extension-underline' {
  interface UnderlineOptions extends ExtensionMeta {}
}

declare module '@tiptap/extension-strike' {
  interface StrikeOptions extends ExtensionMeta {}
}

declare module '@tiptap/extension-subscript' {
  interface SubscriptExtensionOptions extends ExtensionMeta {}
}

declare module '@tiptap/extension-superscript' {
  interface SuperscriptExtensionOptions extends ExtensionMeta {}
}

declare module '@tiptap/extension-link' {
  interface LinkOptions extends ExtensionMeta {}
}

declare module '@tiptap/extension-list' {
  interface BulletListOptions extends ExtensionMeta {}
  interface OrderedListOptions extends ExtensionMeta {}
  interface TaskListOptions extends ExtensionMeta {}
}

declare module '@tiptap/extension-code-block' {
  interface CodeBlockOptions extends ExtensionMeta {
    /** 自定义代码块渲染视图 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeView?: any
    /** 是否使用 Tab 缩进 */
    useTab?: boolean
    /** 是否显示语言选择器 */
    showLanguageSelector?: boolean
  }
}
