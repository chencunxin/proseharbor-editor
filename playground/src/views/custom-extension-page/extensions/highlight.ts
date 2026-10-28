import { Mark, mergeAttributes } from '@proseharbor-editor/core'
import type { CommandProps } from '@proseharbor-editor/core'
import type { MenuContext } from './types'

// 自定义命令需要补一下类型声明，否则 editor.commands.toggleHighlight() 会报类型错误
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      toggleHighlight: () => ReturnType
    }
  }
}

/**
 * 自定义 Mark：高亮
 *
 * options 里除了扩展自身的配置，还要带上「菜单元信息」，
 * 工具栏 / 气泡菜单 / 斜杠菜单都是读这些字段渲染的。
 */
export const Highlight = Mark.create({
  name: 'highlight',

  addOptions() {
    return {
      // ---------- 菜单元信息 ----------
      // name：唯一标识，同时是图标名（kebab-case）、i18n key、插槽名
      name: 'highlight',
      // slash: true + desc：出现在 "/" 斜杠菜单中
      slash: true,
      desc: '高亮选中文字',
      // 仅用于菜单上的提示，真正的按键绑定在 addKeyboardShortcuts 里注册
      // 注意：内置的 background 已经占用了 Mod-Shift-H，这里换一个
      shortcutkeys: 'Mod-Alt-H',
      command: ({ editor, range }: MenuContext) =>
        range
          ? editor.chain().focus().deleteRange(range).toggleHighlight().run()
          : editor.chain().focus().toggleHighlight().run(),
      // 气泡菜单必须提供 isActive（内部直接调用 menu.isActive()）
      isActive: ({ editor }: MenuContext) => editor.isActive('highlight'),
      isDisabled: ({ editor }: MenuContext) => !editor.can().toggleHighlight(),
      // --------------------------------
      HTMLAttributes: {
        class: 'custom-highlight',
        // 内置的 background 也用 <mark>，加个标记避免解析时互相干扰
        'data-type': 'highlight',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'mark[data-type="highlight"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleHighlight:
        () =>
        ({ commands }: CommandProps) =>
          commands.toggleMark(this.name),
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-h': () => this.editor.commands.toggleHighlight(),
    }
  },
})

export default Highlight
