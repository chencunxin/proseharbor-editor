import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { EditorView } from '@tiptap/pm/view'
import { prefixClass } from '../utils/prefix'

export interface SelectionOptions {
  class: string
}

export default Extension.create<SelectionOptions>({
  name: 'Selection',

  addOptions() {
    return {
      class: `${prefixClass}__selection`,
    }
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('selection')
    let activeDecoration: DecorationSet | null = null
    let editorView: EditorView | null = null
    return [
      new Plugin({
        key: pluginKey,
        props: {
          decorations(_state: EditorState) {
            return activeDecoration
          },
        },
        view(view: EditorView) {
          // 保存编辑器视图的引用
          editorView = view
          return {
            update: () => {
              // 更新时清除已有装饰
              activeDecoration = null
            },
            destroy: () => {
              activeDecoration = null
              editorView = null
            },
          }
        },
        appendTransaction: (
          _transactions: readonly Transaction[],
          _oldState: EditorState,
          newState: EditorState,
        ) => {
          // 使用保存的 editorView 引用
          if (!newState.selection.empty && !editorView?.hasFocus()) {
            const { from, to } = newState.selection
            activeDecoration = DecorationSet.create(newState.doc, [
              Decoration.inline(from, to, {
                class: this.options.class,
              }),
            ])
          }
          // 使用保存的 editorView 引用
          if (editorView?.hasFocus()) {
            activeDecoration = null
          }
          return null
        },
      }),
    ]
  },
})
