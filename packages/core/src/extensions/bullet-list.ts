import BulletList from '@tiptap/extension-bullet-list'
import type { ExtensionCommandContext } from '../types/tiptap'
import type { BulletListOptions } from '@tiptap/extension-bullet-list'
import { prefixClass } from '../utils/prefix'

const source = {
  slash: true,
  name: 'bulletList',
  desc: '- proseharbor',
  command: ({ editor, range }: ExtensionCommandContext) => {
    range
      ? editor.chain().focus().deleteRange(range).toggleBulletList().run()
      : editor.commands.toggleBulletList()
  },
  isActive: ({ editor }) => editor.isActive('bulletList'),
  shortcutkeys: 'Mod-Shift-8',
  HTMLAttributes: {
    class: `${prefixClass}__bullet-list`,
  },
}

export default BulletList.extend({
  addOptions() {
    return {
      ...(this.parent?.() ?? ({} as BulletListOptions)),
      ...source,
    }
  },
  // addExtensions() {
  //   return [ListItem]
  // }
})
