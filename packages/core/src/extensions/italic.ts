import Italic from '@tiptap/extension-italic'
import type { ItalicOptions } from '@tiptap/extension-italic'

export default Italic.extend({
  addOptions() {
    return {
      ...(this.parent?.() ?? ({} as ItalicOptions)),
      name: 'italic',
      desc: '*proseharbor*',
      command: ({ editor }) => editor.chain().focus().toggleItalic().run(),
      isActive: ({ editor }) => editor.isActive('italic'),
      isDisabled: ({ editor }) => !editor.can().toggleItalic(),
      shortcutkeys: 'Mod-I',
    }
  },
})
