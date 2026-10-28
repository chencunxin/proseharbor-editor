import { Node, mergeAttributes, prefixClass } from '@proseharbor-editor/core'
import type { CommandProps } from '@proseharbor-editor/core'
import type { MenuContext } from './types'

export type CalloutVariant = 'info' | 'warning' | 'danger'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: { variant?: CalloutVariant }) => ReturnType
      unsetCallout: () => ReturnType
      toggleCallout: (attributes?: { variant?: CalloutVariant }) => ReturnType
    }
  }
}

/**
 * 自定义 Node：提示块（可包住若干块级内容）
 *
 * 非文本块节点不能用 setNode() 插入（tiptap 会警告并放弃），
 * 这里包装 wrapIn / lift，实现「把当前块包进提示块 / 再取消」。
 */
export const Callout = Node.create({
  name: 'callout',

  addOptions() {
    return {
      // ---------- 菜单元信息 ----------
      name: 'callout',
      slash: true,
      desc: '提示块',
      command: ({ editor, range }: MenuContext) =>
        range
          ? editor.chain().focus().deleteRange(range).toggleCallout().run()
          : editor.chain().focus().toggleCallout().run(),
      isActive: ({ editor }: MenuContext) => editor.isActive('callout'),
      isDisabled: ({ editor }: MenuContext) => !editor.can().toggleCallout(),
      // --------------------------------
      HTMLAttributes: {
        class: `${prefixClass}__callout`,
      },
    }
  },

  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info' as CalloutVariant,
        parseHTML: (element) => (element.getAttribute('data-variant') as CalloutVariant) ?? 'info',
        renderHTML: (attributes) => ({ 'data-variant': attributes.variant }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-type': 'callout' }, this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setCallout:
        (attributes = {}) =>
        ({ commands }: CommandProps) =>
          commands.wrapIn(this.name, attributes),
      unsetCallout:
        () =>
        ({ commands }: CommandProps) =>
          commands.lift(this.name),
      toggleCallout:
        (attributes = {}) =>
        ({ commands }: CommandProps) =>
          commands.toggleWrap(this.name, attributes),
    }
  },
})

export default Callout
