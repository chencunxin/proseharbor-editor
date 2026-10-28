import OrderedList from '@tiptap/extension-ordered-list'
import type { ExtensionCommandContext } from '../types/tiptap'
import type { OrderedListOptions } from '@tiptap/extension-ordered-list'
import { prefixClass } from '../utils/prefix'

const source = {
  slash: true,
  name: 'orderedList',
  desc: '1. proseharbor',
  command: ({ editor, range }: ExtensionCommandContext) => {
    range
      ? editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      : editor.commands.toggleOrderedList()
  },
  isActive: ({ editor }) => editor.isActive('orderedList'),
  shortcutkeys: 'Mod-Shift-7',
  HTMLAttributes: {
    class: `${prefixClass}__ordered-list`,
  },
}

export default OrderedList.extend({
  addOptions() {
    return {
      ...(this.parent?.() ?? ({} as OrderedListOptions)),
      ...source,
    }
  },
  // addExtensions() {
  //   return [ListItem]
  // }
})
