import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import type { ExtensionCommandContext } from '../../types/tiptap'
import type { TableOptions } from '@tiptap/extension-table'
import { prefixClass } from '../../utils'
import { TableView } from './table-view'

export default Table.extend({
  addOptions() {
    return {
      ...(this.parent?.() ?? ({} as TableOptions)),
      View: TableView,
      slash: true,
      name: 'table',
      resizable: true,
      desc: '',
      command: ({ editor, range, params }: ExtensionCommandContext) => {
        range
          ? editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertTable({
                rows: params?.rows || 3,
                cols: params?.cols || 3,
                withHeaderRow: params?.withHeaderRow || false,
              })
              .run()
          : editor.commands.insertTable({
              rows: params?.rows || 3,
              cols: params?.cols || 3,
              withHeaderRow: params?.withHeaderRow || false,
            })
      },
      isActive: ({ editor }) => editor.isActive('table'),
      isDisabled: ({ editor }) => !editor.can().insertTable(),
      HTMLAttributes: {
        class: `${prefixClass}__table`,
      },
    }
  },

  addExtensions() {
    return [TableRow, TableHeader, TableCell]
  },
})
