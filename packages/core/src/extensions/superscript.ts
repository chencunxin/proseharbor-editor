import Superscript from '@tiptap/extension-superscript'
import type { SuperscriptExtensionOptions } from '@tiptap/extension-superscript'

export default Superscript.extend({
  addOptions() {
    return {
      ...(this.parent?.() ?? ({} as SuperscriptExtensionOptions)),
      name: 'superscript',
      desc: '',
      command: ({ editor }) => editor.chain().focus().toggleSuperscript().run(),
      isActive: ({ editor }) => editor.isActive('superscript'),
      isDisabled: ({ editor }) => !editor.can().toggleSuperscript(),
      shortcutkeys: 'Mod-.',
    }
  },
})
