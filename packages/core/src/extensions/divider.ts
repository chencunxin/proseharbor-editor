import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core'
import { Fragment } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { prefixClass } from '../utils/prefix'

const source = {
  slash: true,
  name: 'divider',
  desc: '---',
  command: ({ editor, range }) => {
    range
      ? editor.chain().focus().deleteRange(range).setDivider().run()
      : editor.chain().focus().setDivider().run()
  },
  isActive: ({ editor }) => editor.isActive('divider'),
  HTMLAttributes: {
    class: `${prefixClass}__divider`,
  },
}

export default Node.create({
  name: 'divider',

  addOptions() {
    return {
      ...source,
    }
  },

  group: 'block',

  parseHTML() {
    return [{ tag: 'hr' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setDivider:
        () =>
        ({ state, tr }) => {
          const dividerType = state.schema.nodes[this.name]
          if (!dividerType) return false

          const doc = state.doc
          const { $from } = state.selection
          const divider = dividerType.create()

          // 统一插在顶层块之间，避免把分割线塞进列表、表格等嵌套结构
          const hasBlock = $from.depth > 0
          const block = hasBlock ? $from.node(1) : null
          const blockStart = hasBlock ? $from.before(1) : $from.pos
          const blockEnd = hasBlock ? $from.after(1) : $from.pos

          // 光标所在的空文本块可以直接被分割线替换，避免上方多出一行空白
          const canReplaceBlock =
            !!block &&
            block.isTextblock &&
            block.content.size === 0 &&
            doc.canReplace($from.index(0), $from.index(0) + 1, Fragment.from(divider))

          let dividerEnd

          if (canReplaceBlock) {
            tr.replaceWith(blockStart, blockEnd, divider)
            dividerEnd = blockStart + divider.nodeSize
          } else {
            tr.insert(blockEnd, divider)
            dividerEnd = blockEnd + divider.nodeSize
          }

          // 分割线之后必须留出一个可输入的文本块，并把光标放进文本选区里，
          // 否则会选中分割线节点，导致输入或退格直接把分割线删掉
          const $after = tr.doc.resolve(dividerEnd)

          /**
           * 构建产物里可能同时存在多份 prosemirror-state，
           * 用这里 import 的 TextSelection 直接创建选区，会得到与编辑器实例不同类的选区对象，
           * 使 ProseMirror 内部的 `selection instanceof TextSelection` 判断失效，
           * 表现为光标能输入内容但退格无响应（需要移动光标才恢复）。
           * 因此优先复用当前状态里文本选区的类。
           */
          const TextSelectionType =
            state.selection.jsonID === 'text' ? state.selection.constructor : TextSelection

          const createTextSelection = (pos) => TextSelectionType.create(tr.doc, pos)

          if ($after.nodeAfter?.isTextblock) {
            tr.setSelection(createTextSelection(dividerEnd + 1))
          } else {
            const contentMatch = $after.parent.contentMatchAt($after.index())
            const paragraph = state.schema.nodes.paragraph
            const textblockType =
              paragraph && contentMatch.matchType(paragraph) ? paragraph : contentMatch.defaultType

            if (textblockType) {
              tr.insert(dividerEnd, textblockType.create())
              tr.setSelection(createTextSelection(dividerEnd + 1))
            }
          }

          tr.scrollIntoView()

          return true
        },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        type: this.type,
      }),
    ]
  },
})
