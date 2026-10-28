import Bold from '@tiptap/extension-bold'
import type { BoldOptions } from '@tiptap/extension-bold'

export default Bold.extend({
  addOptions() {
    return {
      ...(this.parent?.() ?? ({} as BoldOptions)),
      name: 'bold',
      desc: '**proseharbor**',
      command: ({ editor }) => editor.chain().focus().toggleBold().run(),
      isActive: ({ editor }) => editor.isActive('bold'),
      isDisabled: ({ editor }) => !editor.can().toggleBold(),
      shortcutkeys: 'Mod-B',
    }
  },
})
