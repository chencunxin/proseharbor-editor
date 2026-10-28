import Code from '@tiptap/extension-code'
import { prefixClass } from '../utils/prefix'

export default Code.extend({
  exitable: true,
  addOptions() {
    return {
      ...this.parent?.(),
      name: 'code',
      desc: '`proseharbor`',
      command: ({ editor }) => editor.chain().focus().toggleCode().run(),
      isActive: ({ editor }) => editor.isActive('code'),
      isDisabled: ({ editor }) => !editor.can().toggleCode(),
      shortcutkeys: 'Mod-E',
      HTMLAttributes: {
        class: `${prefixClass}__code`,
      },
    }
  },
})
