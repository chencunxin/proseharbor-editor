import Underline from '@tiptap/extension-underline'
import type { UnderlineOptions } from '@tiptap/extension-underline'

export default Underline.extend({
  addOptions() {
    return {
      ...(this.parent?.() ?? ({} as UnderlineOptions)),
      name: 'underline',
      desc: '',
      command: ({ editor }) => editor.chain().focus().toggleUnderline().run(),
      isActive: ({ editor }) => editor.isActive('underline'),
      isDisabled: ({ editor }) => !editor.can().toggleUnderline(),
      shortcutkeys: 'Mod-U',
    }
  },
})
